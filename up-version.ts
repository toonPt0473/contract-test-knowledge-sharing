import * as fs from "fs";

interface PackageJson {
  scripts: {
    [key: string]: string;
  };
  [key: string]: any;
}

function updateVersion(service: string, newVersion: string) {
  // Validate service type
  const validServices = ["consumer", "provider", "consumer:order"];
  if (!validServices.includes(service)) {
    console.error(
      'Service must be either "consumer", "provider", or "consumer:order"'
    );
    process.exit(1);
  }

  // Validate version format
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(newVersion)) {
    console.error("Version must be in format X.Y.Z (e.g., 1.0.1)");
    process.exit(1);
  }

  let modified = false;

  // Update package.json
  const packageJsonPath = "./package.json";
  try {
    const packageJson: PackageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, "utf-8")
    );

    // Define which scripts to update based on service type
    let scriptsToUpdate: string[];
    switch (service) {
      case "consumer":
        scriptsToUpdate = [
          "publish",
          "can-i-deploy:consumer",
          "record-deployment:consumer",
        ];
        break;
      case "provider":
        scriptsToUpdate = [
          "can-i-deploy:provider",
          "record-deployment:provider",
        ];
        break;
      case "consumer:order":
        scriptsToUpdate = [
          "publish:order",
          "can-i-deploy:consumer:order",
          "record-deployment:consumer:order",
        ];
        break;
      default:
        scriptsToUpdate = [];
    }

    // Update each relevant script
    scriptsToUpdate.forEach((scriptKey) => {
      if (packageJson.scripts[scriptKey]) {
        const script = packageJson.scripts[scriptKey];
        let updatedScript = script;

        if (service === "consumer" || service === "consumer:order") {
          if (scriptKey.startsWith("publish")) {
            updatedScript = script.replace(
              /--consumer-app-version \d+\.\d+\.\d+/,
              `--consumer-app-version ${newVersion}`
            );
          }
          updatedScript = updatedScript.replace(
            /--version \d+\.\d+\.\d+/,
            `--version ${newVersion}`
          );
        } else {
          updatedScript = script.replace(
            /--version \d+\.\d+\.\d+/,
            `--version ${newVersion}`
          );
        }

        if (script !== updatedScript) {
          packageJson.scripts[scriptKey] = updatedScript;
          modified = true;
          console.log(`Updated ${scriptKey} with version ${newVersion}`);
        }
      }
    });

    if (modified) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`Successfully updated package.json for ${service}`);
    }
  } catch (error) {
    console.error("Error reading or writing package.json:", error);
    process.exit(1);
  }

  // Update provider.pact.spec.js if service is provider
  if (service === "provider") {
    const providerSpecPath = "./provider.pact.spec.js";
    try {
      let content = fs.readFileSync(providerSpecPath, "utf-8");

      // Update providerVersion in the spec file
      const updatedContent = content.replace(
        /providerVersion: "\d+\.\d+\.\d+"/,
        `providerVersion: "${newVersion}"`
      );

      if (content !== updatedContent) {
        fs.writeFileSync(providerSpecPath, updatedContent);
        console.log(
          `Updated provider version in provider.pact.spec.js to ${newVersion}`
        );
        modified = true;
      }
    } catch (error) {
      console.error("Error updating provider.pact.spec.js:", error);
      // Don't exit here, as package.json might have been updated successfully
    }
  }

  if (!modified) {
    console.log(`No changes were necessary for ${service}`);
  }
}

// Get parameters from command line
const service = process.argv[2];
const version = process.argv[3];

if (!service || !version) {
  console.error(
    'Please provide both service and version (e.g., "consumer 1.0.1" or "consumer:order 1.0.1")'
  );
  process.exit(1);
}

updateVersion(service, version);

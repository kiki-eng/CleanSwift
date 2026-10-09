#!/usr/bin/env node

import { existsSync, rmSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDirectory, "..");
const isFullClean = process.argv.includes("--all");

const safeRemove = (targetPath) => {
  if (existsSync(targetPath)) {
    try {
      rmSync(targetPath, { recursive: true, force: true });
      return true;
    } catch (e) {
      console.warn(`[clean-native] Could not delete ${targetPath}: ${e.message}`);
      return false;
    }
  }
  return false;
};

console.log("[clean-native] Cleaning intermediate native build artifacts...");

// 1. Android build directories
if (isFullClean) {
  safeRemove(join(projectRoot, "android", "app", "build"));
} else {
  // Preserve outputs (APKs / AABs) if not a full clean
  safeRemove(join(projectRoot, "android", "app", "build", "intermediates"));
  safeRemove(join(projectRoot, "android", "app", "build", "tmp"));
  safeRemove(join(projectRoot, "android", "app", "build", "generated"));
}

safeRemove(join(projectRoot, "android", "build"));
safeRemove(join(projectRoot, "android", ".gradle"));

// 2. iOS project build directory
safeRemove(join(projectRoot, "ios", "build"));

// 3. Xcode DerivedData for this project in ~/Library/Developer/Xcode/DerivedData
const derivedDataDir = join(homedir(), "Library", "Developer", "Xcode", "DerivedData");
if (existsSync(derivedDataDir)) {
  try {
    const projectName = basename(projectRoot).toLowerCase();
    const entries = readdirSync(derivedDataDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const lowerName = entry.name.toLowerCase();
        if (
          lowerName.startsWith(projectName) ||
          (projectName.includes("favvii") && lowerName.includes("favvii")) ||
          (projectName.includes("quote") && lowerName.includes("quoterequest")) ||
          (projectName.includes("transave") && lowerName.includes("transave")) ||
          (projectName.includes("chops") && lowerName.includes("chops"))
        ) {
          if (safeRemove(join(derivedDataDir, entry.name))) {
            console.log(`[clean-native] Purged Xcode DerivedData: ${entry.name}`);
          }
        }
      }
    }
  } catch (_) {}
}

// 4. Purge C++ (.cxx) and module build artifacts within node_modules
const nodeModulesPath = join(projectRoot, "node_modules");
if (existsSync(nodeModulesPath)) {
  let cleanedCount = 0;
  const walkAndClean = (currentDir) => {
    try {
      const entries = readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = join(currentDir, entry.name);
          if ((entry.name === ".cxx" || entry.name === "build") && currentDir.includes("android")) {
            if (safeRemove(fullPath)) {
              cleanedCount++;
            }
          } else if (entry.name !== ".pnpm" && !entry.name.startsWith(".")) {
            walkAndClean(fullPath);
          }
        }
      }
    } catch (_) {}
  };

  walkAndClean(nodeModulesPath);
  if (cleanedCount > 0) {
    console.log(`[clean-native] Purged native compiler caches from ${cleanedCount} module(s).`);
  }
}

// 5. Global Gradle task output cache (~/.gradle/caches/build-cache-1)
if (isFullClean) {
  const gradleBuildCache = join(homedir(), ".gradle", "caches", "build-cache-1");
  if (safeRemove(gradleBuildCache)) {
    console.log("[clean-native] Purged global Gradle build-cache-1.");
  }
}

console.log("[clean-native] Native artifacts cleanup complete.");

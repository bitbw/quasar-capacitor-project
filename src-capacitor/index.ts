import { Capacitor } from "@capacitor/core";
export const platform = Capacitor.getPlatform();
console.log("[env]:" + platform);
export const isWeb = platform === "web"
export const isNative = platform === "ios" || platform === "android"
export function checkEnvironment() {
  const platform = Capacitor.getPlatform();
  if (platform === "web") {
    console.log("[env]:当前环境是浏览器");
  } else if (platform === "ios" || platform === "android") {
    console.log("[env]:当前环境是 Capacitor App");
  } else {
    console.log("[env]:未知环境");
  }
}

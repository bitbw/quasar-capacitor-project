import { Socket } from "@spryrocks/capacitor-socket-connection-plugin";

export const socket = new Socket();
export const IP_ADDRESS = "192.168.19.226";
export const PORT = 8868;

socket.onData = function (data) {
  // Uint8Array to string
  const str = new TextDecoder().decode(data);
  console.log("[BOWEN_LOG] 🚀 ~~ data:", data, str);
  // handle received data
};

socket.onClose = function () {
  // handle socket close
  console.log("[BOWEN_LOG] 🚀 ~~  handle socket close:");
};

socket.onError = function (error) {
  console.log("[BOWEN_LOG] 🚀 ~~ handle socket error error:", error);
  // handle socket error
};

socket.onStateChanged = function (state) {
  console.log("[BOWEN_LOG] 🚀 ~~ handle socket state change:", state);
  // handle socket state change
};

const exec = async () => {
  await socket.open(IP_ADDRESS, PORT);
  // 字符串转 Uint8Array
  const data = new TextEncoder().encode("Hello World! android");
  await socket.write(data);
  console.log("消息发送成功");

  setTimeout(async () => {
    // 断开连接
    await socket.close();
    console.log("断开连接");
  }, 120000);
};


// exec()
import { registerPlugin } from "@capacitor/core";

export interface TcpClientPlugin {
  connect(options: { host: string; port: number }): Promise<{ status: string }>;
  send(options: { message: string }): Promise<{ status: string }>;
  onData(): Promise<{ response: string }>;
  end(): Promise<{ status: string }>;
}

const TCPPlugin = registerPlugin<TcpClientPlugin>("TCPPlugin");

export default TCPPlugin;

// const exec = async () => {
// const requestResult = await TCPPlugin.connect({
//   host: "192.168.59.226",
//   port: 8848,
// });
// const res = await TCPPlugin.send({ message: "Hello World! android" });
// 接收响应
// const response = await TCPPlugin.onData();
// console.log("接收到响应:", response.response);
// };

import { registerPlugin } from "@capacitor/core";

export interface EchoPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}

const Echo = registerPlugin<EchoPlugin>("Echo");

export default Echo;

// const exec = async () => {
// const { value } = await Echo.echo({ value: "Hello World!666" });
// console.log("Echo Response from native:", value);
// }

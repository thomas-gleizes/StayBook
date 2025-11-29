import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";

async function findProto(rootPath: string): Promise<string[]> {
  const protos: string[] = [];

  const files = await fs.promises.readdir(rootPath);

  for (const file of files) {
    const filePath = path.join(rootPath, file);

    const info = await fs.promises.lstat(filePath);

    if (info.isDirectory()) {
      protos.push(...(await findProto(filePath)));
      continue;
    }

    const extension = path.extname(filePath);

    if (extension === ".proto") {
      protos.push(filePath);
    }
  }

  return protos;
}

async function publish() {
  const registry = new SchemaRegistry({
    host: process.env.REGISTRY_URL as string,
  });

  const schemaPath = path.join(
    url.fileURLToPath(import.meta.url),
    "../../schemas",
  );

  const protoPaths = await findProto(schemaPath);

  for (const protoPath of protoPaths) {
    const protoName = path.basename(protoPath, ".proto");
    console.log("Name", protoName);

    const buffer = await fs.promises.readFile(protoPath);

    const result = await registry.register(
      { type: SchemaType.PROTOBUF, schema: buffer.toString() },
      { subject: protoName },
    );

    console.log(`${protoName} -> saved (${result.id})`);
  }
}

publish().catch(console.error);

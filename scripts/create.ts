import { Input } from "https://deno.land/x/cliffy/prompt/mod.ts";
import Template from "https://deno.land/x/template@v0.1.0/mod.ts";

const title: string = await Input.prompt(`Title`);

const description: string = await Input.prompt(`Description`);

const url: string = await Input.prompt(`Url`);

const tpl = new Template({ open: "<%", close: "%>" });

const template = await Deno.readTextFile("./blog/template.md");

console.log(template);


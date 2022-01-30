import { Input } from "https://deno.land/x/cliffy/prompt/mod.ts";
import Template from "https://deno.land/x/template@v0.1.0/mod.ts";
import { format } from "https://deno.land/std@0.123.0/datetime/mod.ts";
import { resolve } from "https://deno.land/std/path/mod.ts";

const title: string = await Input.prompt(`Title`);

const description: string = await Input.prompt(`Description`);

const url: string = await Input.prompt(`Url`);

const tpl = new Template({ open: "<%", close: "%>" });

const template = await Deno.readTextFile("./blog/template.md");

const dirList: string[] = [];
for (const dirEntry of Deno.readDirSync('./blog')) {
    if (dirEntry.isDirectory) {
        dirList.push(dirEntry.name);
    }
}

const date = new Date();

const dateStr = format(date, 'yyyy-MM-dd');

let i = 0;
let dirName = '';
for (; i < 100; i++) {
    dirName = `${dateStr}-${i}`;
    if (dirList.includes(dirName)) {
        continue;
    }
    break;
}

console.log(dirName);

await Deno.mkdir(resolve('./blog', dirName));

const post = tpl.render(template, { title, description, url, publishDate: dateStr });

await Deno.writeTextFile(resolve('./blog', dirName, 'README.md'), post);


console.log('Успех')

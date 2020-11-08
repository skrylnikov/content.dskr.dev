import { walk } from "https://deno.land/std@0.76.0/fs/mod.ts";
import { Marked } from "https://deno.land/x/markdown@v2.0.0/mod.ts";

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

type Item = {
  title: string;
  path: string;
};

const itemlist: Item[] = [];

for await(const {path} of walk('./blog', { includeDirs: false })){
  const parsedPath = path.split('/');
  if(parsedPath.length !== 3){
    continue;
  }
  console.log(path);
  
  const markdown = decoder.decode(await Deno.readFile(path));
  const title = markdown.split('\n')[0].replace('#', '').trim();
  console.log(title);
  
  itemlist.push({
    title,
    path,
  });
}


const blogReadme = '# Blog\n\n' 
  + itemlist.map(({title, path}) => `- [${title}](.${path.replace('blog', '')})`).join('\n')
  + '\n';

await Deno.writeFile('./blog/README.md', encoder.encode( blogReadme));

const mainReadme = '# [Blog](./blog/README.md)\n\n' 
  + itemlist.map(({title, path}) => `- [${title}](.${path})`).join('\n')
  + '\n';

await Deno.writeFile('./README.md', encoder.encode(mainReadme));


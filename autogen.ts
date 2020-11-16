import { walk } from "https://deno.land/std@0.76.0/fs/mod.ts";

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

type Item = {
  title: string;
  path: string;
};

const itemlist: Item[] = [];

for await(const {path, name} of walk('./blog', { includeDirs: false })){
  const parsedPath = path.split('/');
  if(parsedPath.length !== 3 || name !== 'README.md'){
    continue;
  }
  
  const markdown = decoder.decode(await Deno.readFile(path));
  const title = markdown.split('\n')[0].replace('#', '').trim();
  
  itemlist.push({
    title,
    path,
  });
}

const makeMarkdown = (isMain: boolean) => `# ${isMain? '[Blog](./blog/README.md)': 'Blog'}\n\n`
  + itemlist.map(({title, path}) => `- [${title}](${isMain? 'path': '.' + path.replace('blog', '')})`).join('\n')
  + '\n';


await Deno.writeFile('./blog/README.md', encoder.encode(makeMarkdown(false)));

await Deno.writeFile('./README.md', encoder.encode(makeMarkdown(true)));


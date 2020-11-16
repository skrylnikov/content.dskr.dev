import { walk } from "https://deno.land/std@0.76.0/fs/mod.ts";

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

type Item = {
  title: string;
  path: string;
  date: [number, number, number];
};

const itemlist: Item[] = [];

for await(const {path, name} of walk('./blog', { includeDirs: false })){
  const parsedPath = path.split('/');
  if(parsedPath.length !== 3 || name !== 'README.md'){
    continue;
  }
  const markdown = decoder.decode(await Deno.readFile(path));
  const title = markdown.split('\n')[0].replace('#', '').trim();
  const date = parsedPath[1].split('-').map((x) => Number.parseInt(x, 10)) as [number, number, number];
  
  itemlist.push({
    title,
    path,
    date,
  });
}

itemlist.sort((a, b)=>{
  if(a.date[0] !== b.date[0]){
    return b.date[0] - a.date[0];
  }
  if(a.date[1] !== b.date[1]){
    return b.date[1] - a.date[1];
  }
  return b.date[2] - a.date[2];
});

const makeMarkdown = (isMain: boolean) => `# ${isMain? '[Blog](./blog/README.md)': 'Blog'}\n\n`
  + itemlist.map(({title, path}) => `- [${title}](${isMain? 'path': '.' + path.replace('blog', '')})`).join('\n')
  + '\n';


await Deno.writeFile('./blog/README.md', encoder.encode(makeMarkdown(false)));

await Deno.writeFile('./README.md', encoder.encode(makeMarkdown(true)));


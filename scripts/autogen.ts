import { walk } from "https://deno.land/std@0.76.0/fs/mod.ts";
import { Marked } from "https://deno.land/x/markdown@v2.0.0/mod.ts";

type Item = {
  title: string;
  path: string;
  date: [number, number, number, number];
};

const itemlist: Item[] = [];

for await (const { path, name } of walk('./blog', { includeDirs: false })) {
  const parsedPath = path.split('/');
  if (parsedPath.length !== 3 || name !== 'README.md') {
    continue;
  }
  const markdown = await Deno.readTextFile(path);

  const markup = Marked.parse(markdown);

  if (markup.meta.hidden) {
    continue;
  }

  const title = markup.meta.title.trim();
  const date = parsedPath[1].split('-').map((x: string) => Number.parseInt(x, 10)) as [number, number, number, number];

  itemlist.push({
    title,
    path,
    date,
  });
}

itemlist.sort((a, b) => {
  if (a.date[0] !== b.date[0]) {
    return b.date[0] - a.date[0];
  }
  if (a.date[1] !== b.date[1]) {
    return b.date[1] - a.date[1];
  }
  if (a.date[2] !== b.date[2]) {
    return b.date[2] - a.date[2];
  }
  return b.date[3] - a.date[3];
});

const makeMarkdown = (isMain: boolean) => `# Блог\n\n`
  + itemlist.map(({ title, path }) => `- [${title}](${isMain ? path : '.' + path.replace('blog', '')})`).join('\n')
  + '\n';


await Deno.writeTextFile('./blog/README.md', makeMarkdown(false));

await Deno.writeTextFile('./README.md', makeMarkdown(true));


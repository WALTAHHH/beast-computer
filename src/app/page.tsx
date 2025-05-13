// import Image from "next/image";
import { supabase } from '@/lib/supabaseClient';
import Parser from 'rss-parser';

async function fetchAndParseAllRSSFeeds() {
  // Fetch all RSS sources from Supabase
  const { data: sources, error: sourcesError } = await supabase.from('rss_sources').select('*');
  if (sourcesError || !sources) return { feeds: [], sourcesError };

  const parser = new Parser();
  const allFeedItems = [];
  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      // Attach source info to each item
      const itemsWithSource = feed.items.map(item => ({ ...item, source_url: source.url, source_name: source.name }));
      allFeedItems.push(...itemsWithSource);
      // Insert items into Supabase (optional: limit to first 3 for demo)
      await supabase.from('news_items').insert(
        itemsWithSource.slice(0, 3).map(item => ({
          title: item.title,
          content: item.content,
          publication_date: item.pubDate,
          source_url: item.link,
        }))
      );
    } catch (err) {
      // Optionally handle per-feed errors
      continue;
    }
  }
  return { feeds: allFeedItems, sourcesError: null };
}

export default async function Home() {
  const { data, error } = await supabase.from('news_items').select('*');
  const { feeds, sourcesError } = await fetchAndParseAllRSSFeeds();

  return (
    <div>
      <h1>Supabase Test</h1>
      {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <h2>RSS Sources</h2>
      {sourcesError && <pre>{JSON.stringify(sourcesError, null, 2)}</pre>}
      <h2>First 3 Parsed RSS Items</h2>
      <pre>{JSON.stringify(feeds.slice(0, 3), null, 2)}</pre>
    </div>
  );
}

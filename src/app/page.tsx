// import Image from "next/image";
import { supabase } from '@/lib/supabaseClient';

export default async function Home() {
  const { data, error } = await supabase.from('test_table').select('*');

  return (
    <div>
      <h1>Supabase Test</h1>
      {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

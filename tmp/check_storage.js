
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic env parser
const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
  console.log('Listing buckets...');
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Error listing buckets:', error);
  } else {
    console.log('Available buckets:', buckets.map(b => b.name));
    const productsBucket = buckets.find(b => b.name === 'products');
    if (!productsBucket) {
       console.log('Bucket "products" NOT found.');
    } else {
      console.log('Bucket "products" exists.');
    }
  }
}

checkStorage();

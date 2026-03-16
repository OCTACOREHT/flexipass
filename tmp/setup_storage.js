
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic env parser
const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.split('#')[0].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  console.log('Listing buckets...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  const productsBucket = buckets.find(b => b.name === 'products');
  if (!productsBucket) {
    console.log('Creating bucket "products"...');
    const { data: createData, error: createError } = await supabase.storage.createBucket('products', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    if (createError) {
      console.error('Error creating bucket:', createError);
      return;
    }
    console.log('Bucket "products" created successfully!');
  } else {
    console.log('Bucket "products" already exists.');
  }

  // Ensure it is public just in case
  await supabase.storage.updateBucket('products', { public: true });
  console.log('Bucket "products" is now public.');
}

setupStorage();

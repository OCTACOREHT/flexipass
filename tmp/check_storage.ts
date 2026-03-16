
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Error listing buckets:', error);
  } else {
    console.log('Available buckets:', buckets.map(b => b.name));
    const productsBucket = buckets.find(b => b.name === 'products');
    if (!productsBucket) {
      console.log('Bucket "products" NOT found. Creating it...');
      const { data, error: createError } = await supabase.storage.createBucket('products', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
        fileSizeLimit: 5242880 // 5MB
      });
      if (createError) {
        console.error('Error creating bucket:', createError);
      } else {
        console.log('Bucket "products" created successfully!');
      }
    } else {
      console.log('Bucket "products" exists and is', productsBucket.public ? 'public' : 'private');
    }
  }
}

checkStorage();

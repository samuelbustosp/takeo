import re

with open('app/dashboard/products/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add import
code = code.replace("import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '@/lib/data/store';",
"""import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '@/lib/data/store';
import { compressAndUploadImage } from '@/lib/utils/image-compression';""")

# Add uploading state
code = code.replace("const [loading, setLoading] = useState(true);",
"""const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);""")

# Add handleImageUpload
code = code.replace("const handleOpenCreate = () => {",
"""const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const { url, error } = await compressAndUploadImage(file, 'public-assets', 'products');
    setUploadingImage(false);

    if (url) {
      setFormData({ ...formData, image_url: url });
    } else {
      alert('Error uploading image: ' + error);
    }
  };

  const handleOpenCreate = () => {""")

# Replace the URL input with a File input and a preview
old_input = """              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  URL de Imagen (Unsplash / Web)
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>"""

new_input = """              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Imagen del producto
                </label>
                <div className="flex items-center gap-4">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-16 h-16 rounded-xl object-cover" />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {uploadingImage && <p className="text-xs text-orange-500 mt-1">Subiendo y comprimiendo imagen...</p>}
                  </div>
                </div>
              </div>"""

code = code.replace(old_input, new_input)

with open('app/dashboard/products/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

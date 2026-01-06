import { useState } from "react";
import AdminNav from "@/components/AdminNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FaAd,
  FaPlus,
  FaTh,
  FaHamburger,
  FaAlignLeft,
  FaWindowRestore,
  FaTrash,
} from "react-icons/fa";
import { Textarea } from "@/components/ui/textarea";

// Define the 4 default categories with icons and descriptions
const DEFAULT_CATEGORIES = [
  {
    id: "banner",
    label: "Banner",
    description: "Full-width banner ads at top, bottom, or middle of pages",
    icon: FaTh,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: "sidebar",
    label: "Sidebar",
    description: "Vertical sidebar ads positioned on the right side of content",
    icon: FaHamburger,  
    color: "bg-green-50 text-green-600",
  },
  {
    id: "inline",
    label: "Inline",
    description: "In-content ads placed within article text and feeds",
    icon: FaAlignLeft,
    color: "bg-purple-50 text-purple-600",
  },
  {
    id: "popup",
    label: "Popup",
    description: "Pop-up and modal ads for high-impact advertising",
    icon: FaWindowRestore,
    color: "bg-orange-50 text-orange-600",
  },
];

interface CustomCategory {
  id: string;
  label: string;
  description: string;
}

export default function AdminAdCategories() {
  const { toast } = useToast();
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(
    () => {
      const stored = localStorage.getItem("adCategories");
      return stored ? JSON.parse(stored) : [];
    }
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Nama kategori tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    const newCategory: CustomCategory = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, "-"),
      label: newCategoryName,
      description: newCategoryDescription || "Custom ad category",
    };

    // Check for duplicates
    if (customCategories.some((cat) => cat.id === newCategory.id)) {
      toast({
        title: "Error",
        description: "Kategori dengan nama ini sudah ada",
        variant: "destructive",
      });
      return;
    }

    setCustomCategories([...customCategories, newCategory]);
    localStorage.setItem(
      "adCategories",
      JSON.stringify([...customCategories, newCategory])
    );

    toast({
      title: "Sukses",
      description: `Kategori "${newCategoryName}" telah ditambahkan`,
    });

    setNewCategoryName("");
    setNewCategoryDescription("");
    setIsDialogOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
    const updatedCategories = customCategories.filter((cat) => cat.id !== id);
    setCustomCategories(updatedCategories);
    localStorage.setItem("adCategories", JSON.stringify(updatedCategories));

    toast({
      title: "Sukses",
      description: "Kategori telah dihapus",
    });
  };

  return (
    <div className="min-h-screen">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
              Ad Categories
            </h2>
            <p className="text-muted-foreground">
              Kelola kategori iklan untuk platform
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <FaPlus className="w-4 h-4" />
                Kategori Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Kategori Baru</DialogTitle>
                <DialogDescription>
                  Buat kategori iklan baru untuk platform
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Nama Kategori</Label>
                  <Input
                    id="category-name"
                    placeholder="contoh: Video Ads"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">Deskripsi</Label>
                  <Textarea
                    id="category-description"
                    placeholder="Deskripsi singkat kategori ini..."
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleAddCategory} className="w-full">
                  Tambahkan Kategori
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Default Categories Section */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Kategori Default
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEFAULT_CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card
                  key={category.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {category.label}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                    <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      ID: {category.id}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Custom Categories Section */}
        {customCategories.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Kategori Kustom
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customCategories.map((category) => (
                <Card
                  key={category.id}
                  className="p-6 border-dashed hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-lg bg-amber-50">
                        <FaAd className="w-5 h-5 text-amber-600" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {category.label}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                    <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      ID: {category.id}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for Custom Categories */}
        {customCategories.length === 0 && (
          <div className="text-center py-12">
            <FaAd className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground mb-4">
              Belum ada kategori kustom. Buat kategori baru dengan mengklik
              tombol di atas.
            </p>
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-12 p-6 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Informasi</h4>
          <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
            <li>
              Kategori default (Banner, Sidebar, Inline, Popup) tidak dapat
              dihapus
            </li>
            <li>
              Kategori kustom dapat ditambahkan dan dihapus sesuai kebutuhan
            </li>
            <li>Data disimpan secara lokal di browser Anda</li>
            <li>Setiap kategori memiliki ID unik untuk referensi sistem</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}

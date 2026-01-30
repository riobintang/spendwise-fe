import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category, TransactionType } from "@shared/api";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { getDefaultCategoryColor } from "@/utils/colors";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { ResponseBody } from "@/utils/responseBody";

export default function Categories() {
  const queryClient = useQueryClient();

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState(
    getDefaultCategoryColor(TransactionType.EXPENSE)
  );
  const [categoryType, setCategoryType] = useState<TransactionType>(
    TransactionType.EXPENSE
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Fetch categories
  const { data: categoriesData } = useQuery<ResponseBody<Category[]>>({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("test categories")
      const res = await fetchWithAuth("/api/categories");
      return res.json();
    },
  });

  const categories = categoriesData?.data || [];

  // Create category mutation
  const { mutate: createCategory, isPending: isCreating } = useMutation({
    mutationFn: async (data: {
      name: string;
      color: string;
      type: TransactionType;
    }) => {
      const res = await fetchWithAuth("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
    },
  });

  // Update category mutation
  const { mutate: updateCategoryMutation, isPending: isUpdating } = useMutation({
    mutationFn: async (data: {
      id: number;
      name: string;
      color: string;
      type: TransactionType;
    }) => {
      const res = await fetchWithAuth(`/api/categories/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          color: data.color,
          type: data.type,
        }),
      });

      if (!res.ok) throw new Error("Failed to update category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
    },
  });

  // Delete category mutation
  const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithAuth(`/api/categories/${id}`, { method: "DELETE" });

      if (!res.ok) throw new Error("Failed to delete category");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteConfirmId(null);
    },
  });

  const resetForm = () => {
    setCategoryName("");
    setCategoryType(TransactionType.EXPENSE);
    setCategoryColor(getDefaultCategoryColor(TransactionType.EXPENSE, categories));
    setEditingId(null);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setCategoryType(newType);
    // Only update color if not editing and it's not a manual change
    if (!editingId) {
      setCategoryColor(getDefaultCategoryColor(newType, categories));
    }
  };

  const handleEdit = (category: Category) => {
    setCategoryName(category.name);
    setCategoryColor(category.color);
    setCategoryType(category.type);
    setEditingId(category.id);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    if (editingId) {
      updateCategoryMutation({
        id: editingId,
        name: categoryName,
        color: categoryColor,
        type: categoryType,
      });
    } else {
      createCategory({
        name: categoryName,
        color: categoryColor,
        type: categoryType,
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteCategory(id);
  };

  const expenseCategories = categories.filter(
    (c) => c.type === TransactionType.EXPENSE
  );
  const incomeCategories = categories.filter(
    (c) => c.type === TransactionType.INCOME
  );

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage transaction categories
          </p>
        </div>

        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Category" : "Create New Category"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Groceries"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2 items-end">
                    <Input
                      id="color"
                      type="color"
                      value={categoryColor}
                      onChange={(e) => setCategoryColor(e.target.value)}
                      className="h-10 w-16 cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground font-mono">
                      {categoryColor}
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={categoryType}
                    onValueChange={(value) =>
                      handleTypeChange(value as TransactionType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TransactionType.EXPENSE}>
                        Expense
                      </SelectItem>
                      <SelectItem value={TransactionType.INCOME}>
                        Income
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-2">
                  <Button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {editingId ? "Update" : "Create"}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        {expenseCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories ({expenseCategories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(category)}
                        disabled={isUpdating || isDeleting}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirmId(category.id)}
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Income Categories */}
        {incomeCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Income Categories ({incomeCategories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(category)}
                        disabled={isUpdating || isDeleting}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirmId(category.id)}
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) {
                  handleDelete(deleteConfirmId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

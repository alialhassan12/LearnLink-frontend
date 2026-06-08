import { useEffect, useState } from "react";
import { 
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle 
} from "../ui/alert-dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Boxes, Edit } from "lucide-react";
import { useAdminCategoryStore } from "../../store/adminDashboardStores/adminCatgoryStore";
import { Spinner } from "../ui/spinner";
import type { Category } from "../../@types/category";

interface EditCategoryDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    category: Category | null;
    setSelectedCategory: React.Dispatch<React.SetStateAction<Category | null>>
}

const EditCategoryDialog = ({ open, setOpen, category, setSelectedCategory }: EditCategoryDialogProps) => {
    const [title, setCategoryTitle] = useState<string>("");
    const { isEditingCategory, editAdminCategory } = useAdminCategoryStore();

    useEffect(() => {
        if (category) {
            setCategoryTitle(category.title);
        } else {
            setCategoryTitle("");
        }
    }, [category, open]);

    const handleEdit = async () => {
        if (!title.trim() || !category) return;
        await editAdminCategory(category.id, title);
        setOpen(false);
        setCategoryTitle("");
        setSelectedCategory(null);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader className="flex flex-row items-center gap-3 text-left">
                    <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/10 dark:border-indigo-500/20 shrink-0">
                        <Boxes className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <AlertDialogTitle className="text-lg font-bold text-text-strong">
                            Edit Category
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-text-weak">
                            Update the name of this category.
                        </AlertDialogDescription>
                    </div>
                </AlertDialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="category-title" className="text-sm font-semibold text-text-strong">
                            Category Name
                        </Label>
                        <Input
                            id="category-title"
                            placeholder="e.g. Web Development, Data Science..."
                            value={title}
                            disabled={isEditingCategory}
                            onChange={(e) => setCategoryTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleEdit();
                                }
                            }}
                            className="w-full border-border/80 focus-visible:ring-indigo-500/50 rounded-xl"
                            autoFocus
                        />
                        <span className="text-[11px] text-text-weak leading-relaxed">
                            Choose a clear, descriptive name that makes it easy for students to find courses.
                        </span>
                    </div>
                </div>

                <AlertDialogFooter className="border-t border-border/40 pt-4">
                    <AlertDialogCancel
                        variant="outline"
                        size="sm"
                        className="cursor-pointer rounded-xl hover:bg-neutral-800/10"
                        onClick={() => {
                            setCategoryTitle("");
                            setSelectedCategory(null);
                        }}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        variant="default"
                        size="sm"
                        className="cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 rounded-xl transition-all duration-300"
                        onClick={handleEdit}
                        disabled={!title?.trim() || isEditingCategory}
                    >
                        {
                            isEditingCategory ? (
                                <>
                                    <Spinner />
                                    <p className="text-sm font-medium text-white shrink-0">Editing...</p>
                                </>
                            ) : (
                                <>
                                    <Edit className="w-4 h-4 mr-1 shrink-0" />
                                    <p className="text-sm font-medium text-white shrink-0">Edit Category</p>
                                </>
                            )
                        }
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default EditCategoryDialog;
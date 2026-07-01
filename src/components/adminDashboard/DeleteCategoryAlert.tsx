import { 
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle 
} from "../ui/alert-dialog";
import type { Category } from "../../@types/category";
import { useAdminCategoryStore } from "../../store/adminDashboardStores/adminCatgoryStore";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

interface DeleteCategoryAlertProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    category: Category | null;
    setSelectedCategory: React.Dispatch<React.SetStateAction<Category | null>>
}
const DeleteCategoryAlert=({open,setOpen,category,setSelectedCategory}:DeleteCategoryAlertProps)=>{
    const {deleteAdminCategory,isDeleteingCategory}=useAdminCategoryStore();
    
    const handleDelete=async()=>{
        if(category?.id){
            await deleteAdminCategory(category.id);
            setOpen(false);
            setSelectedCategory(null);
        }
    }

    return(
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this category?{category?.title}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={()=>setSelectedCategory(null)} variant="outline" size="sm">
                        Cancel
                    </AlertDialogCancel>
                    <Button 
                        onClick={handleDelete}
                        disabled={isDeleteingCategory}
                        variant="default" 
                        size="sm"
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 rounded-xl transition-all duration-300 cursor-pointer"
                    >
                        {isDeleteingCategory?(
                            <>
                                <Spinner/>
                                <p className="text-sm font-medium text-white shrink-0">Deleting...</p>
                            </>
                        ):(
                            <>
                                <p className="text-sm font-medium text-white shrink-0">Delete</p>
                            </>
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default DeleteCategoryAlert;
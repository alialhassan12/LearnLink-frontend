import { useEffect, useState } from "react";
import { useAdminCategoryStore } from "../../store/adminDashboardStores/adminCatgoryStore";
import { Button } from "../../components/ui/button";
import { Ban, CheckCircle2, Delete, Edit, Eye, MoreVertical, Plus, Search, View } from "lucide-react";
import { Input } from "../../components/ui/input";
import { DropdownMenu,DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Skeleton } from "../../components/ui/skeleton";
import CreateCategoryDialog from "../../components/adminDashboard/CreateCategoryDialog";
import EditCategoryDialog from "../../components/adminDashboard/EditCategoryDialog";
import type { Category } from "../../@types/category";
import DeleteCategoryAlert from "../../components/adminDashboard/DeleteCategoryAlert";
import { Spinner } from "../../components/ui/spinner";

const Categories=()=>{
    const {getAdminCategories,categories,isGettingAdminCategories,changeCategoryStatus,isChangingCategoryStatus}=useAdminCategoryStore();
    const [searchInput,setSearchInput]=useState<string>("");
    const [openCategoryDialog,setOpenCategoryDialog]=useState(false);
    const [openEditCategoryDialog,setEditOpenCategoryDialog]=useState(false);
    const [selectedCategory,setSelectedCategory]=useState<Category | null>(null);
    const [openDeleteAlert,setOpenDeleteAlert]=useState<boolean>(false);

    useEffect(()=>{
        getAdminCategories();
    },[getAdminCategories]);

    const filteredCategories=categories.filter((category)=>category.title.toLocaleLowerCase().includes(searchInput.toLowerCase()));

    return (
        <div className="flex flex-col gap-6">
            {/* header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-text-strong">Categories Management</h1>
                    <p className="text-text-weak">Manage all platform categories used for teachers and courses</p>
                </div>
                <Button
                    onClick={()=>setOpenCategoryDialog(true)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 ease-in-out cursor-pointer hover:scale-105 shrink-0 self-start sm:self-auto"
                >
                    <Plus/>
                    <p>Create Category</p>
                </Button>
            </div>
            {/* search */}
            <div className="flex flex-row items-center justify-between gap-2 border border-border rounded-2xl p-2 bg-card/30">
                {/* search bar */}
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-weak" />
                    <Input
                        placeholder="Search users..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full border-border pl-9 border-none focus-visible:border-none focus-visible:ring-0"
                    />
                </div>
            </div>

            {/* table */}
            <div className="w-full border border-border/80 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-border/80">
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">Category</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">Courses</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">Status</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {isGettingAdminCategories?(
                                <TableSkeleton/>
                            ):filteredCategories.length ==0?(
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-text-weak font-medium">
                                        No Categories Found
                                    </td>
                                </tr>
                            ):(
                                filteredCategories.map((category)=>{
                                    return (
                                        <tr
                                            key={category.id}
                                            className="hover:bg-gray-900/5 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 align-middle">
                                                <span className="font-medium text-text-strong">
                                                    {category.title}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 align-middle">
                                                <span className="font-medium text-text-strong">
                                                    {category.courses_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 align-middle">
                                                {category.status == "active" ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-500">
                                                        <Ban className="w-3 h-3" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 align-middle text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild >
                                                        <Button variant="ghost" disabled={isChangingCategoryStatus} className="h-8 w-8 p-0 cursor-pointer">
                                                            {
                                                                isChangingCategoryStatus &&(selectedCategory?.id === category?.id)?(
                                                                    <Spinner/>
                                                                ):(
                                                                    <MoreVertical className="h-4 w-4" />
                                                                )
                                                            }
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={()=>{
                                                                setSelectedCategory(category);
                                                                setEditOpenCategoryDialog(true);
                                                            }}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={()=>{
                                                                setSelectedCategory(category);
                                                                setOpenDeleteAlert(true);
                                                            }}
                                                        >
                                                            <Delete className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={()=>{
                                                                setSelectedCategory(category)
                                                                changeCategoryStatus(category.status=="active"?"inactive":"active",category.id);
                                                            }}
                                                            disabled={isChangingCategoryStatus}
                                                        >
                                                            {
                                                                category.status == "active"?(
                                                                    <>
                                                                        <Ban className="mr-2 h-4 w-4" />
                                                                        Deactivate
                                                                    </>
                                                                ):(
                                                                    <>
                                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                        Activate
                                                                    </>
                                                                )
                                                            }
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <CreateCategoryDialog open={openCategoryDialog} setOpen={setOpenCategoryDialog} />
            <EditCategoryDialog open={openEditCategoryDialog} setOpen={setEditOpenCategoryDialog} category={selectedCategory} setSelectedCategory={setSelectedCategory}/>
            <DeleteCategoryAlert open={openDeleteAlert} setOpen={setOpenDeleteAlert} category={selectedCategory} setSelectedCategory={setSelectedCategory}></DeleteCategoryAlert>
        </div>
    );
};

const TableSkeleton=()=>{
    return (
        <>
            {[...Array(4)].map((_, index) => (
                <tr key={index} className="border-b border-border/40 last:border-0">
                    <td className="px-6 py-4">
                        <Skeleton className="h-5 w-32 rounded" />
                    </td>
                    <td className="px-6 py-4">
                        <Skeleton className="h-5 w-12 rounded" />
                    </td>
                    <td className="px-6 py-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                        <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                    </td>
                </tr>
            ))}
        </>
    );
};

export default Categories;
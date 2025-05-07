import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, InsertUser } from "@shared/schema";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  UserPlus, 
  Pencil, 
  Trash2, 
  Loader2, 
  User as UserIcon, 
  Shield,
  Factory,
  Truck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Form schema for user creation/edit
const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  fullName: z.string().min(2, "Full name is required"),
  role: z.string().min(1, "Role selection is required"),
  status: z.string().min(1, "Status selection is required"),
  accessRights: z.array(z.string()).optional(),
});

// Role icon mapper
function getRoleIcon(role: string) {
  switch (role) {
    case "admin":
      return <Shield className="h-4 w-4 text-red-600" />;
    case "manufacturer":
      return <Factory className="h-4 w-4 text-blue-600" />;
    case "transporter":
      return <Truck className="h-4 w-4 text-green-600" />;
    case "security":
      return <Shield className="h-4 w-4 text-yellow-600" />;
    default:
      return <UserIcon className="h-4 w-4 text-gray-600" />;
  }
}

export default function UserManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [editUserId, setEditUserId] = useState<number | null>(null);

  // Access rights options
  const accessRightsOptions = [
    { id: "view_dashboard", label: "View Dashboard" },
    { id: "manage_vehicles", label: "Manage Vehicles" },
    { id: "manage_gates", label: "Manage Gates" },
    { id: "manage_weighbridge", label: "Manage Weighbridge" },
    { id: "manage_yard", label: "Manage Yard" },
    { id: "manage_users", label: "Manage Users" },
    { id: "generate_reports", label: "Generate Reports" },
  ];

  // Fetch users
  const usersQuery = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await apiRequest("POST", "/api/users", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddUserOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertUser> }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditUserOpen(false);
      setEditUserId(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/users/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form for adding/editing users
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      mobileNumber: "",
      fullName: "",
      role: "security",
      status: "active",
      accessRights: [],
    },
  });

  // Handle form submission
  function onSubmit(values: z.infer<typeof userFormSchema>) {
    if (editUserId) {
      // When editing, don't send password if it's empty (unchanged)
      const dataToUpdate = { ...values };
      if (dataToUpdate.password === "") {
        delete dataToUpdate.password;
      }
      updateUserMutation.mutate({ id: editUserId, data: dataToUpdate });
    } else {
      addUserMutation.mutate(values as InsertUser);
    }
  }

  // Open edit user dialog
  const handleEditUser = (user: User) => {
    setEditUserId(user.id);
    
    // Set form values based on user data
    form.reset({
      username: user.username,
      password: "", // Don't fill password for security reasons
      email: user.email || "",
      mobileNumber: user.mobileNumber || "",
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      accessRights: user.accessRights || [],
    });
    
    setIsEditUserOpen(true);
  };

  // Handle delete user with confirmation
  const handleDeleteUser = (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(id);
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = usersQuery.data
    ? usersQuery.data.filter((user) => {
        const matchesSearch =
          searchTerm === "" ||
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.mobileNumber && user.mobileNumber.includes(searchTerm));
        
        const matchesRole = roleFilter === "" || user.role === roleFilter;
        
        return matchesSearch && matchesRole;
      })
    : [];

  return (
    <div className="py-6 px-4 sm:px-6 md:px-8">
      <Header
        title="User Management"
        description="Manage system users and their access privileges"
      />

      <div className="max-w-7xl mx-auto py-5">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10 w-full"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manufacturer">Manufacturer</SelectItem>
                <SelectItem value="transporter">Transporter</SelectItem>
                <SelectItem value="security">Security Guard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsAddUserOpen(true)} className="w-full md:w-auto">
            <UserPlus className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Mobile</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          {user.fullName}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.mobileNumber || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.email || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "success" : "destructive"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)} disabled={user.id === 1}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">No users found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit User Modal (Shared Form UI) */}
      {[isAddUserOpen, isEditUserOpen].map((isOpen, index) => (
        <Dialog key={index} open={isOpen} onOpenChange={index === 0 ? setIsAddUserOpen : setIsEditUserOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{index === 0 ? "Add New User" : "Edit User"}</DialogTitle>
              <DialogDescription>
                {index === 0 ? "Create a new user account." : "Update user account details."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["fullName", "username", "email", "mobileNumber", "password"].map((fieldName, i) => (
                    <FormField
                      key={i}
                      control={form.control}
                      name={fieldName}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{fieldName === "mobileNumber" ? "Mobile Number" : fieldName[0].toUpperCase() + fieldName.slice(1)}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type={fieldName === "email" ? "email" : fieldName === "password" ? "password" : "text"}
                              placeholder={
                                fieldName === "email" ? "user@example.com" :
                                fieldName === "password" && index === 1 ? "Leave blank to keep password" :
                                fieldName === "username" ? "username123" : ""
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  {["role", "status"].map((field, i) => (
                    <FormField
                      key={i}
                      control={form.control}
                      name={field}
                      render={({ field: selectField }) => (
                        <FormItem>
                          <FormLabel>{field[0].toUpperCase() + field.slice(1)}</FormLabel>
                          <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${field}`} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {field === "role" ? (
                                ["admin", "manufacturer", "transporter", "security"].map((r) => (
                                  <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
                                ))
                              ) : (
                                ["active", "inactive"].map((s) => (
                                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                {/* Access Rights */}
                <FormField
                  control={form.control}
                  name="accessRights"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base">Access Rights</FormLabel>
                      <FormDescription>Select which areas this user can access</FormDescription>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {accessRightsOptions.map((option) => (
                          <FormField
                            key={option.id}
                            control={form.control}
                            name="accessRights"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value || [], option.id])
                                        : field.onChange(field.value?.filter(v => v !== option.id));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{option.label}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      index === 0 ? setIsAddUserOpen(false) : setIsEditUserOpen(false);
                      form.reset();
                      setEditUserId?.(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto" disabled={(index === 0 ? addUserMutation.isPending : updateUserMutation.isPending)}>
                    {(index === 0 ? addUserMutation.isPending : updateUserMutation.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {index === 0 ? "Adding..." : "Saving..."}
                      </>
                    ) : (
                      index === 0 ? "Add User" : "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
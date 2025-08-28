"use client";

// Force dynamic rendering to prevent prerendering issues with Convex
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FolderOpen, 
  Plus, 
  Search,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProjectsPage() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mock projects data
  const projects = [
    {
      id: 1,
      name: "TaskFlow Mobile App",
      description: "Native mobile application for task management",
      status: "in_progress",
      progress: 75,
      dueDate: "2024-12-15",
      teamMembers: 4,
      tasksCompleted: 12,
      totalTasks: 16,
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: 2,
      name: "Website Redesign",
      description: "Complete overhaul of company website",
      status: "planning",
      progress: 25,
      dueDate: "2024-11-30",
      teamMembers: 3,
      tasksCompleted: 3,
      totalTasks: 12,
      color: "from-green-500 to-teal-500"
    },
    {
      id: 3,
      name: "API Integration",
      description: "Third-party service integrations",
      status: "completed",
      progress: 100,
      dueDate: "2024-10-15",
      teamMembers: 2,
      tasksCompleted: 8,
      totalTasks: 8,
      color: "from-purple-500 to-pink-500"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "planning": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4" />;
      case "in_progress": return <Clock className="w-4 h-4" />;
      case "planning": return <AlertCircle className="w-4 h-4" />;
      default: return <FolderOpen className="w-4 h-4" />;
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-6 pt-2 pb-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track your project portfolio</p>
        </div>
        
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <option>All Status</option>
          <option>In Progress</option>
          <option>Planning</option>
          <option>Completed</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="glass-effect border-none shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${project.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mt-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                    {project.description}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Status and Progress */}
                <div className="flex items-center justify-between">
                  <Badge className={`${getStatusColor(project.status)} border-none`}>
                    {getStatusIcon(project.status)}
                    <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                  </Badge>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {project.progress}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full bg-gradient-to-r ${project.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
                
                {/* Project Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    {project.teamMembers} members
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {project.tasksCompleted}/{project.totalTasks} tasks
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 col-span-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    Due {new Date(project.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm ? `No projects match "${searchTerm}"` : "Get started by creating your first project"}
          </p>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none">
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </motion.div>
      )}
    </div>
  );
}

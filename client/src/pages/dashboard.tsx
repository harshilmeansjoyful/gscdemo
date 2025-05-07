import { useState } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { AlertTriangle, Calendar, Clock } from "lucide-react";

// Sample data - would be replaced with real data from API
const GATE_QUEUE_DATA = [
  { id: 1, vehicleNumber: "MH 04 AB 1234", status: "At Gate", arrivalTime: "14:30", waitingTime: "5m" },
  { id: 2, vehicleNumber: "DL 05 CD 5678", status: "In Yard", arrivalTime: "14:15", waitingTime: "20m" },
  { id: 3, vehicleNumber: "KA 03 EF 9012", status: "At Weighbridge", arrivalTime: "14:00", waitingTime: "35m" },
  { id: 4, vehicleNumber: "TN 02 GH 3456", status: "At Bay", arrivalTime: "13:45", waitingTime: "50m" },
  { id: 5, vehicleNumber: "HR 01 IJ 7890", status: "Exiting", arrivalTime: "13:30", waitingTime: "65m" },
];

const YARD_OCCUPANCY_DATA = [
  { name: "Occupied", value: 12 },
  { name: "Available", value: 8 },
];

const BAY_UTILIZATION_DATA = [
  { name: "Bay 1", utilization: 85 },
  { name: "Bay 2", utilization: 60 },
  { name: "Bay 3", utilization: 90 },
  { name: "Bay 4", utilization: 45 },
  { name: "Bay 5", utilization: 70 },
];

const WEIGHBRIDGE_STATS_DATA = [
  { time: "09:00", inbound: 3, outbound: 1 },
  { time: "10:00", inbound: 5, outbound: 2 },
  { time: "11:00", inbound: 2, outbound: 4 },
  { time: "12:00", inbound: 1, outbound: 3 },
  { time: "13:00", inbound: 4, outbound: 2 },
  { time: "14:00", inbound: 3, outbound: 5 },
];

const DOCUMENT_SUCCESS_DATA = [
  { name: "Success", value: 92 },
  { name: "Failed", value: 8 },
];

const API_STATUS = [
  { name: "ANPR", status: "online" },
  { name: "YMS", status: "online" },
  { name: "Load Mgmt", status: "offline" },
  { name: "Park+", status: "online" },
];

const ALERT_DATA = [
  { 
    id: 1, 
    type: "warning", 
    title: "Vehicle MH 04 AB 1234 waiting too long", 
    description: "Vehicle has been waiting in yard for over 1 hour",
    time: "14:25"
  },
  { 
    id: 2, 
    type: "error", 
    title: "Load Management API is down", 
    description: "Unable to fetch schedule information for new arrivals",
    time: "14:10"
  },
  { 
    id: 3, 
    type: "warning", 
    title: "Bay 3 utilization exceeding 90%", 
    description: "Consider redirecting traffic to other bays",
    time: "13:55"
  },
];

const COLORS = ["#1E4D8C", "#F39C12", "#27AE60", "#E74C3C"];

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [shiftFilter, setShiftFilter] = useState<string>("all");

  // Query for dashboard data
  const dashboardQuery = useQuery({
    queryKey: ["/api/dashboard", dateFilter, shiftFilter],
  });

  return (
    <div className="py-6">
    <Header
      title="Dashboard"
      description="Real-time monitoring of all gate operations"
    />

    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <Select value={shiftFilter} onValueChange={setShiftFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                <SelectItem value="morning">Morning (6AM-2PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (2PM-10PM)</SelectItem>
                <SelectItem value="night">Night (10PM-6AM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={() => dashboardQuery.refetch()} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Live Gate Queue */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base md:text-lg">Live Gate Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {GATE_QUEUE_DATA.map((vehicle) => (
                <div key={vehicle.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">{vehicle.vehicleNumber}</p>
                    <p className="text-sm text-gray-500">Arrived at {vehicle.arrivalTime}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <p className="text-sm text-gray-500">Waiting: {vehicle.waitingTime}</p>
                    <Badge
                      variant={
                        vehicle.status === "At Gate"
                          ? "default"
                          : vehicle.status === "In Yard"
                          ? "secondary"
                          : vehicle.status === "At Weighbridge"
                          ? "outline"
                          : vehicle.status === "At Bay"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {vehicle.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Yard Occupancy */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base md:text-lg">Yard Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={YARD_OCCUPANCY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {YARD_OCCUPANCY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <span className="text-xl font-bold">60%</span>
              <p className="text-gray-500 text-sm">Current Occupancy</p>
            </div>
          </CardContent>
        </Card>

        {/* Weighbridge Stats */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base md:text-lg">Weighbridge Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEIGHBRIDGE_STATS_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="inbound" stroke="#1E4D8C" />
                  <Line type="monotone" dataKey="outbound" stroke="#F39C12" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bay Utilization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base md:text-lg">Bay Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BAY_UTILIZATION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="utilization" fill="#1E4D8C" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Document Generation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base md:text-lg">Document Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DOCUMENT_SUCCESS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {DOCUMENT_SUCCESS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#27AE60" : "#E74C3C"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <span className="text-xl font-bold text-green-500">92%</span>
              <p className="text-gray-500 text-sm">Success Rate</p>
            </div>
          </CardContent>
        </Card>

        {/* API Health & Alerts */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base md:text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="api-health">
              <TabsList className="w-full mb-4 overflow-x-auto whitespace-nowrap">
                <TabsTrigger value="api-health" className="flex-1">API Health Status</TabsTrigger>
                <TabsTrigger value="alerts" className="flex-1">Alerts & Exceptions</TabsTrigger>
              </TabsList>

              <TabsContent value="api-health">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {API_STATUS.map((api) => (
                    <div key={api.name} className="p-3 bg-gray-50 rounded-md text-center">
                      <p className="text-sm font-medium">{api.name}</p>
                      <Badge variant={api.status === "online" ? "default" : "destructive"}>
                        {api.status === "online" ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="alerts">
                <div className="space-y-3">
                  {ALERT_DATA.map((alert) => (
                    <Alert key={alert.id} variant={alert.type === "error" ? "destructive" : "default"}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="flex justify-between">
                        {alert.title}
                        <span className="text-xs text-gray-500">{alert.time}</span>
                      </AlertTitle>
                      <AlertDescription>{alert.description}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  );
}

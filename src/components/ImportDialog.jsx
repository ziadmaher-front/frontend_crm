import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as XLSX from "xlsx";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const MODULES = [
  { value: "accounts", label: "Accounts" },
  { value: "contacts", label: "Contacts" },
  { value: "leads", label: "Leads" },
  { value: "deals", label: "Deals" },
  { value: "tasks", label: "Tasks" },
];

export default function ImportDialog({ open, onOpenChange }) {
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [importStatus, setImportStatus] = useState({ type: null, message: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
        "text/csv", // .csv
      ];
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        setImportStatus({
          type: "error",
          message: "Please select a valid Excel file (.xlsx, .xls) or CSV file (.csv)",
        });
        return;
      }

      setSelectedFile(file);
      setImportStatus({ type: null, message: "" });
    }
  };

  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Convert to array of objects (first row as headers)
          if (jsonData.length === 0) {
            reject(new Error("Excel file is empty"));
            return;
          }

          const headers = jsonData[0];
          const rows = jsonData.slice(1).map((row) => {
            const obj = {};
            headers.forEach((header, index) => {
              if (header) {
                obj[header] = row[index] || "";
              }
            });
            return obj;
          });

          resolve(rows);
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const transformDataForModule = (data, module) => {
    // Transform Excel data to match backend API format
    switch (module) {
      case "accounts":
        return data.map((row) => ({
          name: row.name || row["Account Name"] || row["Company Name"] || "",
          accountNumber: row.accountNumber || row["Account Number"] || undefined,
          phone: row.phone || row["Phone"] || undefined,
          website: row.website || row["Website"] || undefined,
          billing_street: row.billing_street || row["Billing Street"] || row["Address"] || "",
          billing_city: row.billing_city || row["Billing City"] || row["City"] || "",
          billing_state: row.billing_state || row["Billing State"] || row["State"] || undefined,
          billing_zip: row.billing_zip || row["Billing Zip"] || row["Zip"] || undefined,
          billing_country: row.billing_country || row["Billing Country"] || row["Country"] || undefined,
          shipping_street: row.shipping_street || row["Shipping Street"] || undefined,
          shipping_city: row.shipping_city || row["Shipping City"] || undefined,
          shipping_state: row.shipping_state || row["Shipping State"] || undefined,
          shipping_zip: row.shipping_zip || row["Shipping Zip"] || undefined,
          shipping_country: row.shipping_country || row["Shipping Country"] || undefined,
        }));

      case "contacts":
        return data.map((row) => ({
          first_name: row.first_name || row["First Name"] || row["FirstName"] || "",
          last_name: row.last_name || row["Last Name"] || row["LastName"] || "",
          email: row.email || row["Email"] || "",
          phone: row.phone || row["Phone"] || "",
          mobile_phone: row.mobile_phone || row["Mobile Phone"] || row["Mobile"] || "",
          department: row.department || row["Department"] || "",
          mailing_street: row.mailing_street || row["Mailing Street"] || row["Address"] || "",
          mailing_city: row.mailing_city || row["Mailing City"] || row["City"] || "",
          mailing_state: row.mailing_state || row["Mailing State"] || row["State"] || "",
          mailing_zip: row.mailing_zip || row["Mailing Zip"] || row["Zip"] || "",
          mailing_country: row.mailing_country || row["Mailing Country"] || row["Country"] || "",
        }));

      case "leads":
        return data.map((row) => ({
          first_name: row.first_name || row["First Name"] || row["FirstName"] || "",
          last_name: row.last_name || row["Last Name"] || row["LastName"] || "",
          email: row.email || row["Email"] || "",
          phone: row.phone || row["Phone"] || "",
          salutation: row.salutation || row["Title"] || row["Salutation"] || undefined,
          shipping_street: row.shipping_street || row["Shipping Street"] || row["Address"] || "",
          shipping_city: row.shipping_city || row["Shipping City"] || row["City"] || "",
          shipping_state: row.shipping_state || row["Shipping State"] || row["State"] || undefined,
          shipping_country: row.shipping_country || row["Shipping Country"] || row["Country"] || undefined,
          shipping_zip_code: row.shipping_zip_code || row["Shipping Zip"] || row["Zip"] || undefined,
          billing_city: row.billing_city || row["Billing City"] || "",
        }));

      case "deals":
        return data.map((row) => ({
          name: row.name || row["Deal Name"] || row["Name"] || "",
          amount: row.amount ? parseFloat(row.amount) : undefined,
          currency: row.currency || row["Currency"] || "USD",
          stage: row.stage || row["Stage"] || undefined,
          probability: row.probability ? parseInt(row.probability) : undefined,
          closingDate: row.closingDate || row["Closing Date"] || row["Expected Close Date"] || undefined,
          leadSource: row.leadSource || row["Lead Source"] || undefined,
          description: row.description || row["Description"] || undefined,
        }));

      case "tasks":
        return data.map((row) => ({
          subject: row.subject || row["Subject"] || row["Title"] || "",
          dueDate: row.dueDate || row["Due Date"] || row["DueDate"] || undefined,
          status: row.status || row["Status"] || "not started",
          priority: row.priority || row["Priority"] || "Medium",
          notes: row.notes || row["Notes"] || row["Description"] || "",
        }));

      default:
        return data;
    }
  };

  const importMutation = useMutation({
    mutationFn: async ({ module, data }) => {
      const entity = base44.entities[module.charAt(0).toUpperCase() + module.slice(1)];
      if (!entity) {
        throw new Error(`Module ${module} not found`);
      }

      // Import data in batches to avoid overwhelming the server
      const batchSize = 10;
      const results = [];
      const errors = [];

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const batchPromises = batch.map((item) =>
          entity.create(item).catch((error) => {
            errors.push({ item, error: error.message });
            return null;
          })
        );

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter((r) => r !== null));
      }

      return { success: results.length, failed: errors.length, errors };
    },
    onSuccess: (result) => {
      setImportStatus({
        type: "success",
        message: `Successfully imported ${result.success} ${selectedModule}. ${result.failed > 0 ? `${result.failed} failed.` : ""}`,
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [selectedModule] });
      
      toast.success(`Imported ${result.success} ${selectedModule} successfully`);
      
      // Reset form after a delay
      setTimeout(() => {
        setSelectedFile(null);
        setSelectedModule("");
        setImportStatus({ type: null, message: "" });
        onOpenChange(false);
      }, 2000);
    },
    onError: (error) => {
      setImportStatus({
        type: "error",
        message: error.message || "Failed to import data. Please check your file format and try again.",
      });
      toast.error("Import failed: " + error.message);
    },
  });

  const handleImport = async () => {
    if (!selectedModule) {
      setImportStatus({
        type: "error",
        message: "Please select a module",
      });
      return;
    }

    if (!selectedFile) {
      setImportStatus({
        type: "error",
        message: "Please select a file",
      });
      return;
    }

    setIsProcessing(true);
    setImportStatus({ type: null, message: "" });

    try {
      const data = await parseExcelFile(selectedFile);
      const transformedData = transformDataForModule(data, selectedModule);
      
      if (transformedData.length === 0) {
        setImportStatus({
          type: "error",
          message: "No valid data found in the file",
        });
        setIsProcessing(false);
        return;
      }

      await importMutation.mutateAsync({ module: selectedModule, data: transformedData });
    } catch (error) {
      setImportStatus({
        type: "error",
        message: error.message || "Failed to process file",
      });
      toast.error("Import failed: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedFile(null);
      setSelectedModule("");
      setImportStatus({ type: null, message: "" });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Data
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx, .xls) or CSV file to import data into your CRM.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Module Selection */}
          <div className="space-y-2">
            <Label htmlFor="module">Select Module</Label>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger id="module">
                <SelectValue placeholder="Choose a module to import into" />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map((module) => (
                  <SelectItem key={module.value} value={module.value}>
                    {module.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <div className="flex items-center gap-2">
              <input
                id="file"
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              <label
                htmlFor="file"
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors ${
                  selectedFile
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                </span>
              </label>
            </div>
          </div>

          {/* Status Messages */}
          {importStatus.type && (
            <Alert
              variant={importStatus.type === "error" ? "destructive" : "default"}
              className={importStatus.type === "success" ? "bg-green-50 border-green-200" : ""}
            >
              {importStatus.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription>{importStatus.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedModule || !selectedFile || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


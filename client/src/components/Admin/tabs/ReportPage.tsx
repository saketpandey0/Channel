import { getAdminReports, resolveReport } from "../../../services/adminservice";
import type { Report } from "../../../types/admin";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

const ReportPage: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
        try {
            const result = await getAdminReports(1, 10);
            if (result.success && result.data) {
                setReports(result.data.reports); 
            }
        } catch (error) {
            console.error("Error fetching reports", error);
        } finally {
            setLoading(false);
        }
        };
        fetchReports();
    }, []);

    const onAction = async (action: "resolve" | "dismiss", report: Report) => {
        try {
            const status = action === "resolve" ? "RESOLVED" : "DISMISSED";

            let backendAction: "DELETE_STORY" | "DELETE_COMMENT" | "SUSPEND_USER" | undefined;
            if (status === "RESOLVED") {
            if (report.story) backendAction = "DELETE_STORY";
            else if (report.comment) backendAction = "DELETE_COMMENT";
            else if (report.user) backendAction = "SUSPEND_USER";
            }

            const updated = await resolveReport(report.id, status, backendAction);

            setReports((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r))
            );
        } catch (err) {
            console.error(`Failed to ${action} report`, err);
            alert("Something went wrong while updating report.");
        }
    };

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported By</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <img
                    src={
                      report.reportedBy.avatar ||
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                    }
                    alt={report.reportedBy.name}
                    className="mr-3 h-8 w-8 rounded-full"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {report.reportedBy.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      @{report.reportedBy.username}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    report.reason === "SPAM"
                      ? "bg-red-100 text-red-800"
                      : report.reason === "HARASSMENT"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {report.reason.replace("_", " ")}
                </span>
              </td>

              <td className="px-6 py-4 text-sm">
                {report.story && (
                  <div>
                    <span className="font-medium">Story:</span> {report.story.title}
                    <div className="text-gray-500">by @{report.story.author.username}</div>
                  </div>
                )}
                {report.comment && (
                  <div>
                    <span className="font-medium">Comment:</span>{" "}
                    {report.comment.content.substring(0, 50)}...
                    <div className="text-gray-500">by @{report.comment.author.username}</div>
                  </div>
                )}
                {report.user && (
                  <div>
                    <span className="font-medium">User:</span> @{report.user.username}
                  </div>
                )}
              </td>

              <td className="px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    report.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : report.status === "RESOLVED"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {report.status.replace("_", " ")}
                </span>
              </td>

              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(report.createdAt).toLocaleDateString()}
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onAction("resolve", report)}
                    className="text-green-400 hover:text-green-600"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onAction("dismiss", report)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportPage;

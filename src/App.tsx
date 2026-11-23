import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { JournalEntryList } from "./pages/JournalEntryList";
import { JournalEntryDetail } from "./pages/JournalEntryDetail";
import { JournalEntriesProvider } from "./context/JournalEntriesContext";
import { ManualQueue } from "./pages/ManualQueue";
import { ExceptionList } from "./pages/ExceptionList";
import { SOPTerminal } from "./pages/SOPTerminal";
// Dashboard page hidden: /dashboard redirects to Journal Entry (page file kept)
// import { Dashboard } from "./pages/Dashboard";

// Placeholder page for other nav items
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h2 className="text-[20px] font-semibold text-gray-700">{title}</h2>
      <p className="text-[13px] text-gray-400 mt-1">Page coming soon</p>
    </div>
  </div>
);

function App() {
  return (
    <JournalEntriesProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Default redirect */}
            <Route index element={<Navigate to="/journal-entry" replace />} />

            {/* Journal Entry */}
            <Route path="/journal-entry" element={<JournalEntryList />} />
            <Route path="/journal-entry/:id" element={<JournalEntryDetail />} />

            {/* Nav pages */}
            <Route path="/dashboard" element={<Navigate to="/journal-entry" replace />} />
            <Route path="/work-list" element={<ManualQueue />} />
            <Route path="/exception" element={<ExceptionList />} />
            <Route path="/sop-terminal" element={<SOPTerminal />} />
            {/* <Route
              path="/sop-terminal"
              element={<PlaceholderPage title="SOP Terminal" />}
            /> */}
            <Route
              path="/sop-terminal/library/:sopId"
              element={<SOPTerminal />}
            />

            {/* Legacy aliases — keep so old links don't break */}
            <Route
              path="/worklist"
              element={<Navigate to="/work-list" replace />}
            />
            <Route
              path="/sop-library"
              element={<Navigate to="/sop-terminal" replace />}
            />
            <Route path="/admin" element={<PlaceholderPage title="Admin" />} />

            {/* Catch-all */}
            <Route
              path="*"
              element={<Navigate to="/journal-entry" replace />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </JournalEntriesProvider>
  );
}

export default App;

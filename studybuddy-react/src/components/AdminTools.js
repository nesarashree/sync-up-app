import React, { useState } from 'react';
import { importSampleProfiles } from '../utils/importSampleProfiles';

const AdminTools = () => {
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  
  const handleImportProfiles = async () => {
    if (importing) return;
    
    setImporting(true);
    setImportResults(null);
    
    try {
      const result = await importSampleProfiles();
      setImportResults(result);
      console.log('Import result:', result);
    } catch (error) {
      console.error('Error importing profiles:', error);
      setImportResults({
        success: false,
        error: error.message
      });
    } finally {
      setImporting(false);
    }
  };
  
  return (
    <div className="admin-tools">
      <h3>Admin Tools</h3>
      
      <div className="tool-section">
        <h4>Sample Data</h4>
        <button 
          onClick={handleImportProfiles}
          disabled={importing}
          className="admin-button"
        >
          {importing ? 'Importing...' : 'Import Sample Profiles'}
        </button>
        
        {importResults && (
          <div className="import-results">
            <h5>{importResults.success ? 'Import Successful!' : 'Import Failed'}</h5>
            
            {importResults.success && importResults.results && (
              <ul>
                {importResults.results.map((result, index) => (
                  <li key={index}>
                    {result.name}: {result.success ? 'Success' : `Failed - ${result.error}`}
                  </li>
                ))}
              </ul>
            )}
            
            {!importResults.success && importResults.error && (
              <p className="error">{importResults.error}</p>
            )}
          </div>
        )}
      </div>
      
      <style>
        {`
        .admin-tools {
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .tool-section {
          margin-bottom: 20px;
        }
        
        .admin-button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .admin-button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
        
        .import-results {
          margin-top: 15px;
          padding: 10px;
          background-color: white;
          border-radius: 4px;
          border-left: 4px solid #3498db;
        }
        
        .import-results .error {
          color: #e74c3c;
          font-weight: bold;
        }
        `}
      </style>
    </div>
  );
};

export default AdminTools;

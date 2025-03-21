import { useState } from 'react';
import { FiPlus, FiUser, FiX, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { addClientToTrainer } from '@/lib/api';

interface ClientSummary {
  id: string;
  name: string;
  email: string;
  progress: number;
  nextSession: string;
  program: string;
  status?: string;
}

interface ClientsTabProps {
  clients: ClientSummary[];
  onClientSelect: (client: ClientSummary) => void;
  setClients: (clients: ClientSummary[]) => void;
  isLoading?: boolean;
}

export default function ClientsTab({ 
  clients, 
  onClientSelect, 
  setClients,
  isLoading = false
}: ClientsTabProps) {
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    weight: '',
    height: '',
    goal: 'Weight Loss',
    medicalHistory: '',
    experience: 'Beginner'
  });
  const [isAddingClient, setIsAddingClient] = useState(false);

  const handleAddClient = async () => {
    // Validate form data
    if (!newClientData.name || !newClientData.email) {
      toast.error('Name and email are required');
      return;
    }

    setIsAddingClient(true);

    try {
      // Call API to add client
      const result = await addClientToTrainer({
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        age: newClientData.age,
        weight: newClientData.weight,
        height: newClientData.height,
        goal: newClientData.goal,
        medicalHistory: newClientData.medicalHistory,
        experience: newClientData.experience
      });

      if (result.success) {
        // Format the returned client data
        const newClient: ClientSummary = {
          id: result.data.id?.toString() || result.data.govId?.toString() || Math.random().toString(36).substr(2, 9),
          name: result.data.fullName || result.data.username || newClientData.name,
          email: result.data.email || newClientData.email,
          progress: 0,
          nextSession: 'Not scheduled',
          program: newClientData.goal,
          status: result.data.status === 'ACTIVE' ? 'Active' : 'Inactive'
        };
        
        // Add to clients list
        setClients([...clients, newClient]);
        
        // Reset form and close modal
        setNewClientData({
          name: '',
          email: '',
          phone: '',
          age: '',
          weight: '',
          height: '',
          goal: 'Weight Loss',
          medicalHistory: '',
          experience: 'Beginner'
        });
        setShowAddClientModal(false);
        
        toast.success('Client added successfully');
      } else {
        toast.error(result.message || 'Failed to add client');
      }
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
      
      // Create a local client object as fallback
      const newClientId = Math.random().toString(36).substr(2, 9);
      const newClient: ClientSummary = {
        id: newClientId,
        name: newClientData.name,
        email: newClientData.email,
        progress: 0,
        nextSession: 'Not scheduled',
        program: newClientData.goal,
        status: 'Active'
      };
      
      setClients([...clients, newClient]);
      setShowAddClientModal(false);
    } finally {
      setIsAddingClient(false);
    }
  };

  const handleClientDataChange = (field: string, value: string) => {
    setNewClientData({
      ...newClientData,
      [field]: value
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Clients</h2>
          <p className="text-gray-500 mt-1">Manage and track your clients' progress</p>
        </div>
        <button 
          onClick={() => setShowAddClientModal(true)}
          className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Add New Client
        </button>
      </div>
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <p className="text-gray-500 text-lg">Loading clients...</p>
          </div>
        ) : clients.length > 0 ? (
          clients.map((client) => (
            <div key={client.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-semibold text-blue-600">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-600">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-8">
                  <button
                    onClick={() => onClientSelect(client)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Manage Plans
                  </button>
                  <div className="w-48">
                    <p className="text-sm font-medium text-gray-500 mb-2">Progress</p>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                            {client.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                        <div
                          style={{ width: `${client.progress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    client.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {client.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FiUser className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No clients assigned yet</p>
            <p className="text-gray-400 text-sm mt-2">Start by adding your first client</p>
          </div>
        )}
      </div>

      {/* Add New Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Add New Client
              </h2>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleAddClient(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={newClientData.name}
                        onChange={(e) => handleClientDataChange('name', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={newClientData.email}
                        onChange={(e) => handleClientDataChange('email', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="w-full form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={newClientData.phone}
                        onChange={(e) => handleClientDataChange('phone', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        className="w-full form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={newClientData.age}
                        onChange={(e) => handleClientDataChange('age', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Health Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Health Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Weight (kg)
                      </label>
                      <input
                        type="text"
                        className="w-full form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={newClientData.weight}
                        onChange={(e) => handleClientDataChange('weight', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="text"
                        className="w-full form-input rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={newClientData.height}
                        onChange={(e) => handleClientDataChange('height', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fitness Goal
                      </label>
                      <select
                        className="w-full form-select rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={newClientData.goal}
                        onChange={(e) => handleClientDataChange('goal', e.target.value)}
                      >
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Muscle Gain">Muscle Gain</option>
                        <option value="General Fitness">General Fitness</option>
                        <option value="Endurance Training">Endurance Training</option>
                        <option value="Sports Performance">Sports Performance</option>
                        <option value="Rehabilitation">Rehabilitation</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fitness Experience
                      </label>
                      <select
                        className="w-full form-select rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={newClientData.experience}
                        onChange={(e) => handleClientDataChange('experience', e.target.value)}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Medical History */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical History / Special Considerations
                  </label>
                  <textarea
                    rows={3}
                    className="w-full form-textarea rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="List any injuries, conditions or medications that may affect training..."
                    value={newClientData.medicalHistory}
                    onChange={(e) => handleClientDataChange('medicalHistory', e.target.value)}
                  ></textarea>
                </div>
                
                {/* Form Actions */}
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddClientModal(false)}
                    disabled={isAddingClient}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingClient}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    {isAddingClient ? (
                      <>
                        <FiLoader className="animate-spin w-4 h-4 mr-2" />
                        Adding...
                      </>
                    ) : (
                      'Add Client'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
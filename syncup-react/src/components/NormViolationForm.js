import { useState } from "react"
import { db, auth } from "../firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useNavigate } from "react-router-dom";

const VIOLATION_TYPES = ["No-show", "Flaky behavior", "Disrespect", "Harassment", "Spam", "Other"]
const ACTIONS = ["Just documenting", "Warning", "Suspension", "Other"]

export default function NormViolationForm() {
  const [violator, setViolator] = useState("")
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [evidence, setEvidence] = useState("")
  const [action, setAction] = useState("")

  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!violator || !type || !description || !action) {
      alert("Please fill out all required fields.")
      return
    }

    try {
      const user = auth.currentUser
      const reporter = user?.email || "anonymous"

      const report = {
        timestamp: serverTimestamp(),
        reportedBy: reporter,
        violator,
        violationType: type,
        description,
        evidence,
        action,
      }

      await addDoc(collection(db, "normViolations"), report)
      alert("✅ Report submitted!")
    } catch (err) {
      console.error("couldn’t send the report:", err)
      alert(`Something went wrong: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#9DDED3] to-white p-6">
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl">
      {/* back button + form go here */}

    <div className="flex flex-col space-y-4 bg-white p-6 rounded-xl shadow-md w-full">
    <button
      onClick={() => navigate("/home")}
      className="text-blue-500 hover:underline self-start"
    >
      ← Back to Profile
    </button>

    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 w-full"
    >
      <h2 className="text-2xl font-semibold text-center mb-4">Norm Violation Report</h2>

      <div>
        <label className="block mb-1 font-medium">Violator Name</label>
        <input
          value={violator}
          onChange={(e) => setViolator(e.target.value)}
          required
          placeholder="Enter full name or username"
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Type of Violation</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select...</option>
          {VIOLATION_TYPES.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">What happened?</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Brief description of the incident"
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Evidence URL (optional)</label>
        <input
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder="Link to screenshots, messages, etc."
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Suggested Action</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select...</option>
          {ACTIONS.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        Submit Report
      </button>
    </form>
    </div>
    </div>
    </div>
  )
}

import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import BuyerForm from "@/components/BuyerForm";
import { BuyerFormData } from "@/types/buyer";

const NewBuyerPage = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: BuyerFormData) => {
    // Form handles creation internally, just redirect after success
    navigate("/buyers");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Lead</h1>
          <p className="text-muted-foreground">
            Capture comprehensive buyer information with validation
          </p>
        </div>
        <BuyerForm onSubmit={handleSubmit} />
      </div>
    </Layout>
  );
};

export default NewBuyerPage;
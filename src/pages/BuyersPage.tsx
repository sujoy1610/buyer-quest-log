import Layout from "@/components/Layout";
import BuyerList from "@/components/BuyerList";
import { Buyer } from "@/types/buyer";
import { useNavigate } from "react-router-dom";

const BuyersPage = () => {
  const navigate = useNavigate();
  
  const handleEdit = (buyer: Buyer) => {
    navigate(`/buyers/${buyer.id}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buyer Leads</h1>
          <p className="text-muted-foreground">
            Manage and track all your buyer leads in one place
          </p>
        </div>
        <BuyerList onEdit={handleEdit} />
      </div>
    </Layout>
  );
};

export default BuyersPage;
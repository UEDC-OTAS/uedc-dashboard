import { MdOutlinePersonAddAlt } from "react-icons/md";
import AccountTable from "./AccountTable";
import getAllUsers from "../../api/accountApi/getAlluser";
import { useEffect, useState } from "react";
import AddStaffModal from "./AddStaffModal";
import { useNavigate } from "react-router-dom";

function Accounts() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    const res = await getAllUsers();
    // console.log(res);
    if (res.code === 200) {
      const filteredUsers = res.data.filter((user) => user.isDeleted !== true);
      setUsers(filteredUsers);
    } else if (res.code === 403) {
      navigate("/unauthorized");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-full px-4">
      <div className="flex items-center justify-between ">
        <h1 className="header">Staff Account Management</h1>
        <div className="flex items-center gap-10">
          {/* <div className="w-[400px]">
            <SearchBar placeholder="Search Product with name or Product Code" />
          </div> */}
          <button
            className="button w-[150px]"
            onClick={() => setIsModalOpen(true)}
          >
            <MdOutlinePersonAddAlt size={20} />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      <AccountTable users={users} refetch={fetchUsers} />

      <AddStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => {
          setIsModalOpen(false);
          fetchUsers();
        }}
      />
    </div>
  );
}

export default Accounts;

import { FaPlus } from "react-icons/fa";
import Modal from "../../components/modal/modal";
import { useState } from "react";
import { useMutation, useQuery } from "../../hooks/api-call";
import { api } from "../../api";
import { Class, ProtectionLevel } from "../../types";
import { Link } from "react-router-dom";

export default function Create() {
  const [isShowing, setIsShowing] = useState(false);
  const classes = useQuery({
    initialData: [],
    query: async () => (await api.fetchClasses()).data,
  });

  function handleCreate(class_: Class) {
    classes.setData([...classes.data, class_]);
    setIsShowing(false);
  }

  return (
    <main>
      <div>
        <h1>Create a Class</h1>
        <button onClick={() => setIsShowing(true)}>
          <FaPlus />
          <span>Create</span>
        </button>
      </div>
      <ul>
        {classes.data.map((c) => (
          <li key={c.id}>
            <Link to={`/create/${c.id}`}>{c.name}</Link>
          </li>
        ))}
      </ul>
      <Modal show={isShowing} close={() => setIsShowing(false)}>
        <CreateModal onCreate={handleCreate} />
      </Modal>
    </main>
  );
}

type CreateModalProps = {
  onCreate: (class_: Class) => void;
};

function CreateModal({ onCreate }: CreateModalProps) {
  const [name, setName] = useState("");
  const [protection, setProtection] = useState<ProtectionLevel>("public");
  const create = useMutation({
    mutation: async () => (await api.createClass(name, protection)).data,
  });

  async function handleCreate() {
    const res = await create.mutate();
    if (res) {
      onCreate(res);
    }
  }

  return (
    <div>
      <h1>Create a Class</h1>
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="protection">Protection</label>
        <select
          id="protection"
          value={protection}
          onChange={(e) => setProtection(e.target.value as ProtectionLevel)}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
        </select>
        <button onClick={handleCreate}>Create</button>
      </div>
    </div>
  );
}

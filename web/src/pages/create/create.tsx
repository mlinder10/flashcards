import styles from "./create.module.css";
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
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Create a Class</h1>
        <button
          onClick={() => setIsShowing(true)}
          className={styles["create-btn"]}
        >
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
      <Modal
        show={isShowing}
        close={() => setIsShowing(false)}
        title="Create a Class"
      >
        <CreateModal onCreate={handleCreate} />
      </Modal>
    </main>
  );
}

type CreateModalProps = {
  onCreate: (class_: Class) => void;
};

function CreateModal({ onCreate }: CreateModalProps) {
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [courseNumber, setCourseNumber] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [protection, setProtection] = useState<ProtectionLevel>("public");
  const create = useMutation({
    mutation: async () =>
      (
        await api.createClass(
          university,
          department,
          courseNumber,
          name,
          description,
          protection
        )
      ).data,
  });

  async function handleCreate() {
    const res = await create.mutate();
    if (res) {
      onCreate(res);
    }
  }

  return (
    <div className={styles["modal-container"]}>
      <div>
        <label htmlFor="university">University</label>
        <input
          type="text"
          id="university"
          placeholder="University of South Carolina"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="department">Department</label>
        <input
          type="text"
          id="department"
          placeholder="Psychology"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="courseNumber">Course Number</label>
        <input
          type="text"
          id="courseNumber"
          placeholder="PYSC 420"
          value={courseNumber}
          onChange={(e) => setCourseNumber(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          placeholder="Survey of Human Development"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <input
          type="text"
          id="description"
          placeholder="TODO: Add description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
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
      </div>
      <button
        onClick={handleCreate}
        disabled={create.loading}
        className={styles["modal-create-btn"]}
      >
        Create
      </button>
    </div>
  );
}

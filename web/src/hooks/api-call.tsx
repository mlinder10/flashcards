import { useState, useEffect, Dispatch, SetStateAction } from "react";

type QueryProps<T> = {
  initialData: T;
  query: () => Promise<T>;
  callOnMount?: boolean;
};

type QueryRespone<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  setData: Dispatch<SetStateAction<T>>;
  fetchData: () => Promise<void>;
  fetchDataWithoutMutation: () => Promise<T | null>;
};

export function useQuery<T>({
  initialData,
  query,
  callOnMount = true,
}: QueryProps<T>): QueryRespone<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await query();
      setData(res);
    } catch (error: any) {
      console.error(error);
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDataWithoutMutation() {
    setLoading(true);
    setError(null);
    try {
      const res = await query();
      return res;
    } catch (error: any) {
      console.error(error);
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
    return null;
  }

  useEffect(() => {
    if (callOnMount) {
      fetchData();
    }
  }, []);

  return { data, loading, error, setData, fetchData, fetchDataWithoutMutation };
}

type MutationProps<T> = {
  mutation: (...args: any) => Promise<T>;
};

type MutationRespone<T> = {
  mutate: (...args: any) => Promise<T | null>;
  loading: boolean;
  error: string | null;
};

export function useMutation<T>({
  mutation,
}: MutationProps<T>): MutationRespone<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mutate(...args: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await mutation(...args);
      return res;
    } catch (error) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
    return null;
  }

  return { mutate, loading, error };
}

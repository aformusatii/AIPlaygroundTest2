import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import type {
  PaginationMeta,
  Secret,
  SecretForm,
  SecretUpdateForm,
  ApiKey,
  ApiKeyForm,
  ApiKeyUpdateForm,
  SshKey,
  SshKeyForm,
  SshKeyUpdateForm,
  BankCard,
  BankCardForm,
  BankCardUpdateForm,
  BankAccount,
  BankAccountForm,
  BankAccountUpdateForm,
} from '@/types/resources';
import {
  listResource,
  createResource,
  updateResource,
  deleteResource,
  copySecretField,
  type ListParams,
} from '@/services/resources';
import { useWorkspaceStore } from './workspaces';

interface ResourceStoreConfig<T, CreatePayload, UpdatePayload> {
  name: string;
  resource: string;
  defaultLimit?: number;
  defaultSort?: string;
  copyFields?: Record<string, string>;
  mapItem?: (item: T, helpers: { workspaceName: (id: string) => string | undefined }) => T & Record<string, unknown>;
}

interface ResourceState<T> {
  items: T[];
  meta: PaginationMeta;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  sort: string;
  q: string;
}

const createDefaultMeta = (): PaginationMeta => ({ total: 0, page: 1, limit: 20, totalPages: 1, hasMore: false });

const createResourceStore = <T, CreatePayload, UpdatePayload>
(config: ResourceStoreConfig<T, CreatePayload, UpdatePayload>) => {
  return defineStore(config.name, () => {
    const state = reactive<ResourceState<T>>({
      items: [] as T[],
      meta: createDefaultMeta(),
      loading: false,
      error: null,
      page: 1,
      limit: config.defaultLimit ?? 20,
      sort: config.defaultSort ?? '-updatedAt',
      q: '',
    });

    const workspaceStore = useWorkspaceStore();

    const workspaceName = (id: string) => workspaceStore.items.find((workspace) => workspace.id === id)?.name;

    const fetch = async (overrides: Partial<ListParams> = {}) => {
      if (!workspaceStore.selectedWorkspaceId) {
        state.items = [] as T[];
        state.meta = createDefaultMeta();
        return;
      }
      state.loading = true;
      try {
        const params: ListParams = {
          page: overrides.page ?? state.page,
          limit: overrides.limit ?? state.limit,
          sort: overrides.sort ?? state.sort,
          q: overrides.q ?? state.q,
          workspaceId: overrides.workspaceId ?? workspaceStore.selectedWorkspaceId,
        };
        const response = await listResource<T>(config.resource, params);
        state.items = response.data.map((item) => {
          if (config.mapItem) {
            return config.mapItem(item, { workspaceName }) as T;
          }
          return item;
        });
        state.meta = response.meta;
        state.page = response.meta.page;
        state.limit = response.meta.limit;
        state.sort = params.sort ?? state.sort;
        state.q = params.q ?? state.q;
        state.error = null;
      } catch (error) {
        console.error(error);
        state.error = 'Failed to fetch data';
      } finally {
        state.loading = false;
      }
    };

    const setSearch = (value: string) => {
      state.q = value;
    };

    const setPage = (page: number) => {
      state.page = page;
    };

    const create = async (payload: CreatePayload) => {
      const response = await createResource<CreatePayload, T>(config.resource, payload);
      await fetch({ page: 1 });
      return response.data;
    };

    const update = async (id: string, payload: UpdatePayload) => {
      const response = await updateResource<UpdatePayload, T>(config.resource, id, payload);
      await fetch({ page: state.page });
      return response.data;
    };

    const remove = async (id: string) => {
      await deleteResource(config.resource, id);
      await fetch({ page: state.page });
    };

    const copy = async (id: string, fieldKey: string) => {
      if (!config.copyFields || !config.copyFields[fieldKey]) {
        throw new Error(`Copy field ${fieldKey} not configured`);
      }
      return copySecretField(config.resource, id, config.copyFields[fieldKey]);
    };

    const hasItems = computed(() => state.items.length > 0);

    return {
      state,
      fetch,
      create,
      update,
      remove,
      copy,
      setSearch,
      setPage,
      hasItems,
    };
  });
};

export const useSecretsStore = createResourceStore<Secret, SecretForm, SecretUpdateForm>({
  name: 'secrets',
  resource: 'secrets',
  defaultSort: '-updatedAt,name',
  copyFields: { password: 'password' },
});

export const useApiKeysStore = createResourceStore<ApiKey, ApiKeyForm, ApiKeyUpdateForm>({
  name: 'api-keys',
  resource: 'api-keys',
  defaultSort: '-updatedAt,name',
  copyFields: { apiKey: 'apiKey' },
});

export const useSshKeysStore = createResourceStore<SshKey, SshKeyForm, SshKeyUpdateForm>({
  name: 'ssh-keys',
  resource: 'ssh-keys',
  defaultSort: '-updatedAt,name',
  copyFields: { privateKey: 'privateKey' },
});

export const useBankCardsStore = createResourceStore<BankCard, BankCardForm, BankCardUpdateForm>({
  name: 'bank-cards',
  resource: 'bank-cards',
  defaultSort: '-updatedAt,cardholderName',
  copyFields: { cardNumber: 'cardNumber', cvv: 'cvv' },
});

export const useBankAccountsStore = createResourceStore<BankAccount, BankAccountForm, BankAccountUpdateForm>({
  name: 'bank-accounts',
  resource: 'bank-accounts',
  defaultSort: '-updatedAt,bankName',
  copyFields: { accountNumber: 'accountNumber' },
});

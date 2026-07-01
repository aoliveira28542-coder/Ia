import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Character, CreateCharacterRequest, CreateJobRequest, CreatePresetRequest, ErrorResponse, GenerationPreset, HealthStatus, Job, JobAssets, ListCharacters200, ListJobAttempts200, ListJobs200, ListPresets200, ListWebhooks200, SystemMetrics, SystemStatus, TestWebhook200, UpdateCharacterRequest, Webhook, WebhookInput } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListJobsUrl: () => string;
/**
 * @summary List all jobs
 */
export declare const listJobs: (options?: RequestInit) => Promise<ListJobs200>;
export declare const getListJobsQueryKey: () => readonly ["/api/jobs"];
export declare const getListJobsQueryOptions: <TData = Awaited<ReturnType<typeof listJobs>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listJobs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listJobs>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListJobsQueryResult = NonNullable<Awaited<ReturnType<typeof listJobs>>>;
export type ListJobsQueryError = ErrorType<unknown>;
/**
 * @summary List all jobs
 */
export declare function useListJobs<TData = Awaited<ReturnType<typeof listJobs>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listJobs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateJobUrl: () => string;
/**
 * @summary Create a video generation job
 */
export declare const createJob: (createJobRequest: CreateJobRequest, options?: RequestInit) => Promise<Job>;
export declare const getCreateJobMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createJob>>, TError, {
        data: BodyType<CreateJobRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createJob>>, TError, {
    data: BodyType<CreateJobRequest>;
}, TContext>;
export type CreateJobMutationResult = NonNullable<Awaited<ReturnType<typeof createJob>>>;
export type CreateJobMutationBody = BodyType<CreateJobRequest>;
export type CreateJobMutationError = ErrorType<unknown>;
/**
* @summary Create a video generation job
*/
export declare const useCreateJob: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createJob>>, TError, {
        data: BodyType<CreateJobRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createJob>>, TError, {
    data: BodyType<CreateJobRequest>;
}, TContext>;
export declare const getGetJobUrl: (id: string) => string;
/**
 * @summary Get job by ID
 */
export declare const getJob: (id: string, options?: RequestInit) => Promise<Job>;
export declare const getGetJobQueryKey: (id: string) => readonly [`/api/jobs/${string}`];
export declare const getGetJobQueryOptions: <TData = Awaited<ReturnType<typeof getJob>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getJob>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getJob>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetJobQueryResult = NonNullable<Awaited<ReturnType<typeof getJob>>>;
export type GetJobQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get job by ID
 */
export declare function useGetJob<TData = Awaited<ReturnType<typeof getJob>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getJob>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListJobAttemptsUrl: (id: string) => string;
/**
 * @summary List attempt history for a job
 */
export declare const listJobAttempts: (id: string, options?: RequestInit) => Promise<ListJobAttempts200>;
export declare const getListJobAttemptsQueryKey: (id: string) => readonly [`/api/jobs/${string}/attempts`];
export declare const getListJobAttemptsQueryOptions: <TData = Awaited<ReturnType<typeof listJobAttempts>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listJobAttempts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listJobAttempts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListJobAttemptsQueryResult = NonNullable<Awaited<ReturnType<typeof listJobAttempts>>>;
export type ListJobAttemptsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary List attempt history for a job
 */
export declare function useListJobAttempts<TData = Awaited<ReturnType<typeof listJobAttempts>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listJobAttempts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListPresetsUrl: () => string;
/**
 * @summary List all generation presets
 */
export declare const listPresets: (options?: RequestInit) => Promise<ListPresets200>;
export declare const getListPresetsQueryKey: () => readonly ["/api/presets"];
export declare const getListPresetsQueryOptions: <TData = Awaited<ReturnType<typeof listPresets>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPresets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPresets>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPresetsQueryResult = NonNullable<Awaited<ReturnType<typeof listPresets>>>;
export type ListPresetsQueryError = ErrorType<unknown>;
/**
 * @summary List all generation presets
 */
export declare function useListPresets<TData = Awaited<ReturnType<typeof listPresets>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPresets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreatePresetUrl: () => string;
/**
 * @summary Create a generation preset
 */
export declare const createPreset: (createPresetRequest: CreatePresetRequest, options?: RequestInit) => Promise<GenerationPreset>;
export declare const getCreatePresetMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPreset>>, TError, {
        data: BodyType<CreatePresetRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPreset>>, TError, {
    data: BodyType<CreatePresetRequest>;
}, TContext>;
export type CreatePresetMutationResult = NonNullable<Awaited<ReturnType<typeof createPreset>>>;
export type CreatePresetMutationBody = BodyType<CreatePresetRequest>;
export type CreatePresetMutationError = ErrorType<ErrorResponse>;
/**
* @summary Create a generation preset
*/
export declare const useCreatePreset: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPreset>>, TError, {
        data: BodyType<CreatePresetRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPreset>>, TError, {
    data: BodyType<CreatePresetRequest>;
}, TContext>;
export declare const getGetPresetUrl: (id: string) => string;
/**
 * @summary Get a preset by ID or name
 */
export declare const getPreset: (id: string, options?: RequestInit) => Promise<GenerationPreset>;
export declare const getGetPresetQueryKey: (id: string) => readonly [`/api/presets/${string}`];
export declare const getGetPresetQueryOptions: <TData = Awaited<ReturnType<typeof getPreset>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPreset>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPreset>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPresetQueryResult = NonNullable<Awaited<ReturnType<typeof getPreset>>>;
export type GetPresetQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a preset by ID or name
 */
export declare function useGetPreset<TData = Awaited<ReturnType<typeof getPreset>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPreset>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getDeletePresetUrl: (id: string) => string;
/**
 * @summary Delete a preset
 */
export declare const deletePreset: (id: string, options?: RequestInit) => Promise<void>;
export declare const getDeletePresetMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePreset>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deletePreset>>, TError, {
    id: string;
}, TContext>;
export type DeletePresetMutationResult = NonNullable<Awaited<ReturnType<typeof deletePreset>>>;
export type DeletePresetMutationError = ErrorType<ErrorResponse>;
/**
* @summary Delete a preset
*/
export declare const useDeletePreset: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePreset>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deletePreset>>, TError, {
    id: string;
}, TContext>;
export declare const getListCharactersUrl: () => string;
/**
 * @summary List all characters
 */
export declare const listCharacters: (options?: RequestInit) => Promise<ListCharacters200>;
export declare const getListCharactersQueryKey: () => readonly ["/api/characters"];
export declare const getListCharactersQueryOptions: <TData = Awaited<ReturnType<typeof listCharacters>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCharacters>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCharacters>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCharactersQueryResult = NonNullable<Awaited<ReturnType<typeof listCharacters>>>;
export type ListCharactersQueryError = ErrorType<unknown>;
/**
 * @summary List all characters
 */
export declare function useListCharacters<TData = Awaited<ReturnType<typeof listCharacters>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCharacters>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCharacterUrl: () => string;
/**
 * @summary Create a character
 */
export declare const createCharacter: (createCharacterRequest: CreateCharacterRequest, options?: RequestInit) => Promise<Character>;
export declare const getCreateCharacterMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCharacter>>, TError, {
        data: BodyType<CreateCharacterRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCharacter>>, TError, {
    data: BodyType<CreateCharacterRequest>;
}, TContext>;
export type CreateCharacterMutationResult = NonNullable<Awaited<ReturnType<typeof createCharacter>>>;
export type CreateCharacterMutationBody = BodyType<CreateCharacterRequest>;
export type CreateCharacterMutationError = ErrorType<unknown>;
/**
* @summary Create a character
*/
export declare const useCreateCharacter: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCharacter>>, TError, {
        data: BodyType<CreateCharacterRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCharacter>>, TError, {
    data: BodyType<CreateCharacterRequest>;
}, TContext>;
export declare const getGetCharacterUrl: (id: string) => string;
/**
 * @summary Get a character by ID
 */
export declare const getCharacter: (id: string, options?: RequestInit) => Promise<Character>;
export declare const getGetCharacterQueryKey: (id: string) => readonly [`/api/characters/${string}`];
export declare const getGetCharacterQueryOptions: <TData = Awaited<ReturnType<typeof getCharacter>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCharacter>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCharacter>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCharacterQueryResult = NonNullable<Awaited<ReturnType<typeof getCharacter>>>;
export type GetCharacterQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a character by ID
 */
export declare function useGetCharacter<TData = Awaited<ReturnType<typeof getCharacter>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCharacter>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateCharacterUrl: (id: string) => string;
/**
 * @summary Update a character
 */
export declare const updateCharacter: (id: string, updateCharacterRequest: UpdateCharacterRequest, options?: RequestInit) => Promise<Character>;
export declare const getUpdateCharacterMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCharacter>>, TError, {
        id: string;
        data: BodyType<UpdateCharacterRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCharacter>>, TError, {
    id: string;
    data: BodyType<UpdateCharacterRequest>;
}, TContext>;
export type UpdateCharacterMutationResult = NonNullable<Awaited<ReturnType<typeof updateCharacter>>>;
export type UpdateCharacterMutationBody = BodyType<UpdateCharacterRequest>;
export type UpdateCharacterMutationError = ErrorType<ErrorResponse>;
/**
* @summary Update a character
*/
export declare const useUpdateCharacter: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCharacter>>, TError, {
        id: string;
        data: BodyType<UpdateCharacterRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCharacter>>, TError, {
    id: string;
    data: BodyType<UpdateCharacterRequest>;
}, TContext>;
export declare const getDeleteCharacterUrl: (id: string) => string;
/**
 * @summary Delete a character
 */
export declare const deleteCharacter: (id: string, options?: RequestInit) => Promise<void>;
export declare const getDeleteCharacterMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCharacter>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCharacter>>, TError, {
    id: string;
}, TContext>;
export type DeleteCharacterMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCharacter>>>;
export type DeleteCharacterMutationError = ErrorType<ErrorResponse>;
/**
* @summary Delete a character
*/
export declare const useDeleteCharacter: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCharacter>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCharacter>>, TError, {
    id: string;
}, TContext>;
export declare const getGetSystemStatusUrl: () => string;
/**
 * @summary Worker and queue health status
 */
export declare const getSystemStatus: (options?: RequestInit) => Promise<SystemStatus>;
export declare const getGetSystemStatusQueryKey: () => readonly ["/api/system/status"];
export declare const getGetSystemStatusQueryOptions: <TData = Awaited<ReturnType<typeof getSystemStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSystemStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSystemStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSystemStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getSystemStatus>>>;
export type GetSystemStatusQueryError = ErrorType<unknown>;
/**
 * @summary Worker and queue health status
 */
export declare function useGetSystemStatus<TData = Awaited<ReturnType<typeof getSystemStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSystemStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSystemMetricsUrl: () => string;
/**
 * @summary Aggregate job processing metrics
 */
export declare const getSystemMetrics: (options?: RequestInit) => Promise<SystemMetrics>;
export declare const getGetSystemMetricsQueryKey: () => readonly ["/api/system/metrics"];
export declare const getGetSystemMetricsQueryOptions: <TData = Awaited<ReturnType<typeof getSystemMetrics>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSystemMetrics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSystemMetrics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSystemMetricsQueryResult = NonNullable<Awaited<ReturnType<typeof getSystemMetrics>>>;
export type GetSystemMetricsQueryError = ErrorType<unknown>;
/**
 * @summary Aggregate job processing metrics
 */
export declare function useGetSystemMetrics<TData = Awaited<ReturnType<typeof getSystemMetrics>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSystemMetrics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListJobAssetsUrl: (id: string) => string;
/**
 * @summary List assets produced by a completed job
 */
export declare const listJobAssets: (id: string, options?: RequestInit) => Promise<JobAssets>;
export declare const getListJobAssetsQueryKey: (id: string) => readonly [`/api/jobs/${string}/assets`];
export declare const getListJobAssetsQueryOptions: <TData = Awaited<ReturnType<typeof listJobAssets>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listJobAssets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listJobAssets>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListJobAssetsQueryResult = NonNullable<Awaited<ReturnType<typeof listJobAssets>>>;
export type ListJobAssetsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary List assets produced by a completed job
 */
export declare function useListJobAssets<TData = Awaited<ReturnType<typeof listJobAssets>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listJobAssets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRetryJobUrl: (id: string) => string;
/**
 * @summary Retry a failed or cancelled job
 */
export declare const retryJob: (id: string, options?: RequestInit) => Promise<Job>;
export declare const getRetryJobMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof retryJob>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof retryJob>>, TError, {
    id: string;
}, TContext>;
export type RetryJobMutationResult = NonNullable<Awaited<ReturnType<typeof retryJob>>>;
export type RetryJobMutationError = ErrorType<ErrorResponse>;
/**
* @summary Retry a failed or cancelled job
*/
export declare const useRetryJob: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof retryJob>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof retryJob>>, TError, {
    id: string;
}, TContext>;
export declare const getCancelJobUrl: (id: string) => string;
/**
 * @summary Cancel a queued or processing job
 */
export declare const cancelJob: (id: string, options?: RequestInit) => Promise<Job>;
export declare const getCancelJobMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof cancelJob>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof cancelJob>>, TError, {
    id: string;
}, TContext>;
export type CancelJobMutationResult = NonNullable<Awaited<ReturnType<typeof cancelJob>>>;
export type CancelJobMutationError = ErrorType<ErrorResponse>;
/**
* @summary Cancel a queued or processing job
*/
export declare const useCancelJob: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof cancelJob>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof cancelJob>>, TError, {
    id: string;
}, TContext>;
export declare const getListWebhooksUrl: () => string;
/**
 * @summary List all registered webhooks
 */
export declare const listWebhooks: (options?: RequestInit) => Promise<ListWebhooks200>;
export declare const getListWebhooksQueryKey: () => readonly ["/api/webhooks"];
export declare const getListWebhooksQueryOptions: <TData = Awaited<ReturnType<typeof listWebhooks>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listWebhooks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listWebhooks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListWebhooksQueryResult = NonNullable<Awaited<ReturnType<typeof listWebhooks>>>;
export type ListWebhooksQueryError = ErrorType<unknown>;
/**
 * @summary List all registered webhooks
 */
export declare function useListWebhooks<TData = Awaited<ReturnType<typeof listWebhooks>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listWebhooks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateWebhookUrl: () => string;
/**
 * @summary Register a new webhook
 */
export declare const createWebhook: (webhookInput: WebhookInput, options?: RequestInit) => Promise<Webhook>;
export declare const getCreateWebhookMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createWebhook>>, TError, {
        data: BodyType<WebhookInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createWebhook>>, TError, {
    data: BodyType<WebhookInput>;
}, TContext>;
export type CreateWebhookMutationResult = NonNullable<Awaited<ReturnType<typeof createWebhook>>>;
export type CreateWebhookMutationBody = BodyType<WebhookInput>;
export type CreateWebhookMutationError = ErrorType<ErrorResponse>;
/**
* @summary Register a new webhook
*/
export declare const useCreateWebhook: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createWebhook>>, TError, {
        data: BodyType<WebhookInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createWebhook>>, TError, {
    data: BodyType<WebhookInput>;
}, TContext>;
export declare const getDeleteWebhookUrl: (id: string) => string;
/**
 * @summary Remove a registered webhook
 */
export declare const deleteWebhook: (id: string, options?: RequestInit) => Promise<void>;
export declare const getDeleteWebhookMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteWebhook>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteWebhook>>, TError, {
    id: string;
}, TContext>;
export type DeleteWebhookMutationResult = NonNullable<Awaited<ReturnType<typeof deleteWebhook>>>;
export type DeleteWebhookMutationError = ErrorType<ErrorResponse>;
/**
* @summary Remove a registered webhook
*/
export declare const useDeleteWebhook: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteWebhook>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteWebhook>>, TError, {
    id: string;
}, TContext>;
export declare const getTestWebhookUrl: (id: string) => string;
/**
 * @summary Send a test ping to a webhook
 */
export declare const testWebhook: (id: string, options?: RequestInit) => Promise<TestWebhook200>;
export declare const getTestWebhookMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof testWebhook>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof testWebhook>>, TError, {
    id: string;
}, TContext>;
export type TestWebhookMutationResult = NonNullable<Awaited<ReturnType<typeof testWebhook>>>;
export type TestWebhookMutationError = ErrorType<ErrorResponse>;
/**
* @summary Send a test ping to a webhook
*/
export declare const useTestWebhook: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof testWebhook>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof testWebhook>>, TError, {
    id: string;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map
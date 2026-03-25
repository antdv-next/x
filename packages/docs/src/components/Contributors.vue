<script lang="ts" setup>
import { useLocale } from "@/composables/use-locale.ts";
import { docsRoutes } from "@/router/docs.ts";

defineOptions({
  name: "Contributors",
});

interface ICommit {
  comment_count: number;
}

interface ICommitAuthor {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
}

interface ICommitsData {
  sha: string;
  node_id: string;
  commit: ICommit;
  url: string;
  html_url: string;
  comments_url: string;
  author: ICommitAuthor;
  committer: ICommitAuthor;
  parents: [];
}

interface IContributors {
  login?: string;
  url?: string;
  avatar?: string;
  count?: number;
}

const route = useRoute();
const { t } = useLocale();

const contributors = ref<IContributors[]>([]);

const formatContributors = (data: ICommitsData[]) => {
  const contributorMap = new Map<string, IContributors>();

  data.forEach(item => {
    if (item.author?.login) {
      const login = item.author.login;
      if (contributorMap.has(login)) {
        const existing = contributorMap.get(login)!;
        existing.count = (existing.count || 0) + 1;
      } else {
        contributorMap.set(login, {
          login: item.author.login,
          url: item.author.html_url,
          avatar: item.author.avatar_url,
          count: 1,
        });
      }
    }
  });

  contributors.value = Array.from(contributorMap.values()).sort(
    (a, b) => (b.count || 0) - (a.count || 0),
  );
};

watchEffect(async () => {
  const pageRoute = docsRoutes.filter(r => r.name === route.name)?.[0];
  if (!pageRoute) {
    return null;
  }
  const path = ((pageRoute.meta?.source ?? "") as string).replace(
    "..",
    "packages/docs/src",
  );
  try {
    const data = await fetch(
      `https://api.github.com/repos/antdv-next/x/commits?path=${path}`,
    ).then(res => res.json());
    formatContributors(data);
  } catch {
    return null;
  }
});
</script>

<template>
  <div class="relative mt-10">
    <div class="text-sm op-50 mb-4">{{ t("contributors.title") }}</div>
    <div class="flex flex-wrap">
      <a-avatar-group>
        <a-tooltip
          v-for="user in contributors"
          :key="user.login"
          :title="`${user.login}`"
        >
          <a :href="user.url" :title="user.login" target="_blank">
            <a-avatar :src="user.avatar" :alt="user.login" />
          </a>
        </a-tooltip>
      </a-avatar-group>
    </div>
  </div>
</template>

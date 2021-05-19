<template>
  <v-col cols="12" md="6" class="DataCard">
    <div class="notPublic">
      <StaticCard>
        <h2>{{ $t('非公式：InFormal') }}</h2>
        <p>
          {{
            $t(
              '最初は新規機能で直近２週間のデータを扱います。それ以前の記録的性格の陽性数は興味の外です。'
            )
          }}
        </p>
        <p>
          {{
            $t(
              '以降は公式同様、初期からの全データを扱います。そういう意味で思いっきり真似っこですし、非公式です。'
            )
          }}
        </p>
        <p>
          {{ $t('データは年月日で扱っています。') }}
        </p>
        <p>
          {{ $t('個々人は十分に頑張っていると思います。 ') }}
        </p>
        <p>
          {{ $t('release:2021/01 &nbsp;&nbsp; 2nd:2021/05') }}
        </p>
      </StaticCard>
    </div>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import StaticCard from '@/components/StaticCard.vue'

export default Vue.extend({
  components: {
    StaticCard
  },
  head: (): MetaInfo => ({
    title: '非公式：InFormal'
  })
})
</script>

<style lang="scss">
.About {
  &-Heading {
    @include font-size(30);

    font-weight: normal;
    color: $gray-2;
    margin-bottom: 12px;
  }
}
</style>

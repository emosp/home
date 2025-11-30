<template>
  <div style="padding: 20px">
    <n-page-header
      subtitle="自己求的片 要记得看哦"
      @back="
        router.push({
          name: ROUTE_NAME_INDEX,
        })
      ">
      <template #title> 求片列表 </template>
      <template #extra>
        <n-button @click="getData">刷新</n-button>
      </template>
    </n-page-header>

    <div class="mt-5">
      <n-data-table
        :bordered="false"
        :loading="table_loading"
        :columns="columns"
        :data="datas"
        :pagination="pagination"
        @update:filters="tableFilter"
        @update:sorter="tableSorter"
        remote />
    </div>
  </div>
</template>
<script setup lang="tsx">
  import type { DataTableColumns } from 'naive-ui'
  import { ROUTE_NAME_INDEX } from '@/router'
  import { useClipboard } from '@vueuse/core'
  import { ref } from 'vue'
  import instance from '@/utils/ky'
  import { dayjs } from '@common/dayjs'
  import { nMessage } from '@/utils/naive'

  import { useRouter } from 'vue-router'
  const router = useRouter()

  const DICT_VIDEO_TYPES = {
      movie: '电影',
      tv: '电视',
    },
    DICT_STATUS = {
      default: '默认',
      upload: '已认领',
      complete: '完成',
      cancel: '取消',
      forget: '遗忘',
    }

  const objectToLabelValue = (rows) => {
    let data = []
    for (let value in rows) {
      data.push({
        label: rows[value],
        value,
      })
    }
    return data
  }

  const table_loading = ref(true),
    search = ref({}),
    columns: DataTableColumns = [
      {
        key: 'video_type',
        title: 'ID',
        width: 120,
        filter: true,
        filterMultiple: false,
        filterOptions: objectToLabelValue(DICT_VIDEO_TYPES),
        render: (row) => (
          <n-button
            text
            type="primary"
            onClick={() => {
              let { copy } = useClipboard()
              copy(row.item_id)
              nMessage().success('复制成功')
            }}>
            {row.item_id}
          </n-button>
        ),
      },
      {
        key: 'video_title',
        title: '视频名称',
        minWidth: 100,
        resizable: true,
      },
      {
        key: 'video_cover',
        title: '视频封面',
        width: 100,
        render: (row) => <n-image width="100" src={row.video_cover} />,
      },
      {
        key: 'tmdb',
        title: 'TMDB',
        width: 100,
        render: (row) => (
          <n-button text tag="a" href={row.tmdb_url} target="_blank" type="primary">
            {row.tmdb_id}
          </n-button>
        ),
      },
      {
        key: 'count_request',
        title: '求片人数',
        width: 100,
        sorter: true,
        render: (row) => (
          <n-popover trigger="hover" disabled={!row.users.length}>
            {{
              default: () => <n-data-table style="height: 200px; width: 400px" columns={request_columns} data={row.users} flex-height />,
              trigger: () => <n-button text>{row.count_request}</n-button>,
            }}
          </n-popover>
        ),
      },
      {
        key: 'count_point',
        title: '悬赏胡萝卜',
        width: 120,
        sorter: true,
      },
      {
        key: 'updated_at',
        title: '更新时间',
        width: 120,
        sorter: true,
        defaultSortOrder: 'descend',
        render: (row) => dayjs(row.updated_at).fromNow(),
      },
      {
        key: 'status',
        title: '状态',
        width: 100,
        filter: true,
        filterMultiple: true,
        filterOptions: objectToLabelValue(DICT_STATUS),
        render: (row) => DICT_STATUS[row.status],
      },
      {
        key: 'upload_username',
        title: '认领人',
        width: 100,
        filter: true,
        filterMultiple: false,
        filterOptions: [
          {
            label: '我认领的',
            value: 'self',
          },
        ],
      },
      {
        key: 'action',
        title: '操作',
        minWidth: 200,
        render: (row) => {
          if (['default', 'upload', 'forget'].includes(row.status)) {
            return (
              <n-button-group>
                <n-popconfirm onPositiveClick={() => seekUrge(row, 10)} disabled={row.urge_loading}>
                  {{
                    default: () => '将使用10胡萝卜催上片',
                    trigger: () => (
                      <div class="mr-1">
                        <n-button loading={row.urge_loading} tertiary type="primary">
                          催上片
                        </n-button>
                      </div>
                    ),
                  }}
                </n-popconfirm>
                {row.is_can_claim ? (
                  row.upload_username ? (
                    <n-popconfirm onPositiveClick={() => seekClaim(row, 'cancel')} disabled={row.claim_loading}>
                      {{
                        default: () => '取消认领此上传任务',
                        trigger: () => (
                          <n-button loading={row.claim_loading} tertiary type="warning">
                            取消认领
                          </n-button>
                        ),
                      }}
                    </n-popconfirm>
                  ) : (
                    <n-popconfirm onPositiveClick={() => seekClaim(row, 'confirm')} disabled={row.claim_loading}>
                      {{
                        default: () => '确认认领此上传任务',
                        trigger: () => (
                          <n-button loading={row.claim_loading} tertiary type="info">
                            认领
                          </n-button>
                        ),
                      }}
                    </n-popconfirm>
                  )
                ) : (
                  <n-button disabled tertiary type="info">
                    {dayjs(row.upload_expired_at).fromNow(true)} 后可认领
                  </n-button>
                )}
              </n-button-group>
            )
          }
        },
      },
    ],
    datas = ref([]),
    pagination = ref({
      onChange: (page) => {
        pagination.value.page = page
        getData()
      },
    }),
    getData = async () => {
      table_loading.value = true
      let res = await instance
        .post('/api/seek', {
          json: {
            ...search.value,
            page: pagination.value.page,
          },
        })
        .json()

      datas.value = res.items
      pagination.value.page = res.page
      pagination.value.pageSize = res.page_size
      pagination.value.itemCount = res.total
      table_loading.value = false
    }

  const tableFilter = (filters) => {
      search.value = Object.assign(search.value, filters)
      pagination.value.page = 1
      getData()
    },
    tableSorter = (sorter) => {
      search.value['sort_by'] = sorter.columnKey
      search.value['sort_order'] = sorter.order == 'descend' ? 'desc' : 'asc'
      pagination.value.page = 1
      getData()
    }

  getData()

  const request_columns: DataTableColumns = [
    {
      key: 'created_at',
      title: '求片时间',
      render: (row) => dayjs(row.created_at).format('YY-MM-DD HH:mm'),
      width: 160,
    },
    {
      key: 'point',
      title: '支付胡萝卜',
      width: 100,
    },
    {
      key: 'username',
      title: '昵称',
    },
  ]

  const seekClaim = (row, type) => {
    row.claim_loading = true
    instance
      .put('/api/seek/claim', {
        json: {
          id: row.id,
          type,
        },
      })
      .then(async (res) => {
        let { status } = await res.json()

        row.status = status
        if (status == 'upload') {
          nMessage().success('认领成功 1小时有效')
          row.upload_username = '本人'
        } else {
          nMessage().success('取消认领成功')
          row.upload_username = null
        }
      })
      .finally(() => {
        row.claim_loading = false
      })
  }

  const seekUrge = (row, point) => {
    row.urge_loading = true
    instance
      .put('/api/seek/urge', {
        json: {
          id: row.id,
          point,
        },
      })
      .then(async (res) => {
        let { count_point } = await res.json()
        row.count_point = count_point
        nMessage().success('催促成功')
      })
      .finally(() => {
        row.urge_loading = false
      })
  }
</script>
<style scoped lang="stylus"></style>

<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="今日活躍會員" :value="1280" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="本月銷售額 (TWD)" :value="526000" :precision="2">
            <template #prefix>
              $
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="待處理訂單" :value="36" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card>
          <template #header>近期活動</template>
          <el-empty description="暫無近期活動"></el-empty>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>快捷操作</template>
          <div class="quick-actions">
            <el-button type="primary" plain>新增會員</el-button>
            <el-button type="success" plain>建立訂單</el-button>
            <el-button type="info" plain>查看報告</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
// In the future, you can fetch real data here.
</script>

<style scoped>
.dashboard-container {
  padding: 10px;
}
.quick-actions {
  display: flex;
  flex-direction: column;
}
.quick-actions .el-button {
  margin-bottom: 10px;
  width: 100%;
  margin-left: 0;
}
</style>

<template>
  <div class="member-form-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-page-header @back="goBack" :content="isEdit ? '編輯會員' : '新增會員'" />
        </div>
      </template>

      <el-form
        ref="memberFormRef"
        :model="memberForm"
        :rules="memberRules"
        label-width="120px"
        label-position="right"
        style="max-width: 600px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="memberForm.name" placeholder="請輸入會員姓名" />
        </el-form-item>
        <el-form-item label="手機" prop="phone">
          <el-input v-model="memberForm.phone" placeholder="請輸入手機號碼" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="memberForm.email" placeholder="請輸入電子郵件" />
        </el-form-item>
        <el-form-item label="註冊分店" prop="homeBranchId">
          <el-select v-model="memberForm.homeBranchId" placeholder="請選擇分店" style="width: 100%">
            <el-option
              v-for="branch in branches"
              :key="branch.id"
              :label="branch.name"
              :value="branch.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生日" prop="birthDate">
          <el-date-picker
            v-model="memberForm.birthDate"
            type="date"
            placeholder="選擇生日"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="性別" prop="gender">
          <el-select v-model="memberForm.gender" placeholder="請選擇性別" style="width: 100%">
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">儲存</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { membersApi, type Branch, type CreateMemberDto, type UpdateMemberDto } from '../../api/members';

const router = useRouter();
const route = useRoute();

const memberFormRef = ref<FormInstance>();
const loading = ref(false);
const isEdit = ref(false);
const branches = ref<Branch[]>([]);

const memberForm = reactive({
  id: null as string | null,
  name: '',
  phone: '',
  email: '',
  homeBranchId: '',
  birthDate: '',
  gender: '' as 'male' | 'female' | 'other' | '',
});

const memberRules = reactive<FormRules>({
  name: [{ required: true, message: '請輸入會員姓名', trigger: 'blur' }],
  phone: [{ message: '請輸入手機號碼', trigger: 'blur' }],
  email: [
    { type: 'email', message: '請輸入有效的電子郵件格式', trigger: ['blur', 'change'] },
  ],
  homeBranchId: [{ required: true, message: '請選擇註冊分店', trigger: 'change' }],
});

const loadBranches = async () => {
  try {
    branches.value = await membersApi.getBranches();
  } catch (error: any) {
    console.error('載入分店資料失敗:', error);
    ElMessage.error('載入分店資料失敗');
  }
};

const loadMember = async (id: string) => {
  try {
    loading.value = true;
    const member = await membersApi.getMember(id);
    
    // 填入表單資料
    Object.assign(memberForm, {
      id: member.id,
      name: member.name,
      phone: member.phone || '',
      email: member.email || '',
      homeBranchId: member.homeBranchId,
      birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : '',
      gender: member.gender || '',
    });
  } catch (error: any) {
    console.error('載入會員資料失敗:', error);
    ElMessage.error(error.response?.data?.message || '載入會員資料失敗');
    router.push('/members');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadBranches();
  
  const id = route.params.id as string;
  if (id) {
    isEdit.value = true;
    await loadMember(id);
  }
});

const goBack = () => {
  router.push('/members');
};

const handleSubmit = async () => {
  if (!memberFormRef.value) return;

  try {
    const valid = await memberFormRef.value.validate();
    if (!valid) return;

    loading.value = true;

    if (isEdit.value && memberForm.id) {
      // 更新會員
      const updateData: UpdateMemberDto = {
        name: memberForm.name,
        phone: memberForm.phone || undefined,
        email: memberForm.email || undefined,
        homeBranchId: memberForm.homeBranchId,
        birthDate: memberForm.birthDate || undefined,
        gender: memberForm.gender || undefined,
      };
      
      await membersApi.updateMember(memberForm.id, updateData);
      ElMessage.success('會員資料更新成功！');
    } else {
      // 新增會員
      const createData: CreateMemberDto = {
        name: memberForm.name,
        phone: memberForm.phone || undefined,
        email: memberForm.email || undefined,
        homeBranchId: memberForm.homeBranchId,
        birthDate: memberForm.birthDate || undefined,
        gender: memberForm.gender || undefined,
      };
      
      await membersApi.createMember(createData);
      ElMessage.success('新增會員成功！');
    }

    router.push('/members');
  } catch (error: any) {
    console.error('儲存會員資料失敗:', error);
    ElMessage.error(error.response?.data?.message || '儲存會員資料失敗');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.member-form-container {
  padding: 10px;
}
.card-header {
  display: flex;
  align-items: center;
}
</style>

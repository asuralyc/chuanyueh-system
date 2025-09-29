<template>
  <div class="employee-form-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-page-header @back="goBack" :content="isEdit ? '編輯員工' : '新增員工'" />
        </div>
      </template>

      <el-form
        ref="employeeFormRef"
        :model="employeeForm"
        :rules="employeeRules"
        label-width="120px"
        label-position="right"
        style="max-width: 600px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="employeeForm.name" placeholder="請輸入員工姓名" />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input
            v-model="employeeForm.email"
            placeholder="請輸入電子郵件（作為登入帳號）"
            :disabled="isEdit"
          />
        </el-form-item>

        <el-form-item label="密碼" prop="password" v-if="!isEdit">
          <el-input
            v-model="employeeForm.password"
            type="password"
            placeholder="請輸入登入密碼"
            show-password
          />
        </el-form-item>

        <el-form-item label="重設密碼" prop="password" v-if="isEdit">
          <el-input
            v-model="employeeForm.password"
            type="password"
            placeholder="留空則不更改密碼"
            show-password
          />
        </el-form-item>

        <el-form-item label="所屬分店" prop="branchId">
          <el-select v-model="employeeForm.branchId" placeholder="請選擇分店" style="width: 100%">
            <el-option
              v-for="branch in branches"
              :key="branch.id"
              :label="branch.name"
              :value="branch.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="職位" prop="title">
          <el-input v-model="employeeForm.title" placeholder="請輸入職位（選填）" />
        </el-form-item>

        <el-form-item label="手機" prop="phone">
          <el-input v-model="employeeForm.phone" placeholder="請輸入手機號碼（選填）" />
        </el-form-item>

        <el-form-item label="到職日期" prop="hireDate">
          <el-date-picker
            v-model="employeeForm.hireDate"
            type="date"
            placeholder="選擇到職日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="狀態" prop="status" v-if="isEdit">
          <el-select v-model="employeeForm.status" placeholder="請選擇狀態" style="width: 100%">
            <el-option label="在職" value="active" />
            <el-option label="停職" value="inactive" />
            <el-option label="離職" value="resigned" />
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
import { employeesApi, branchesApi, type Branch, type CreateEmployeeDto, type UpdateEmployeeDto } from '../../api/employees';

const router = useRouter();
const route = useRoute();

const employeeFormRef = ref<FormInstance>();
const loading = ref(false);
const isEdit = ref(false);
const branches = ref<Branch[]>([]);

const employeeForm = reactive({
  id: null as string | null,
  name: '',
  email: '',
  password: '',
  branchId: '',
  title: '',
  phone: '',
  hireDate: '',
  status: 'active' as 'active' | 'inactive' | 'resigned',
});

const employeeRules = reactive<FormRules>({
  name: [{ required: true, message: '請輸入員工姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電子郵件格式', trigger: ['blur', 'change'] },
  ],
  password: [
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (!isEdit.value && !value) {
          callback(new Error('請輸入密碼'));
        } else if (value && value.length < 6) {
          callback(new Error('密碼長度至少 6 個字元'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  branchId: [{ required: true, message: '請選擇所屬分店', trigger: 'change' }],
});

const loadBranches = async () => {
  try {
    const response = await branchesApi.getBranches();
    branches.value = response;
  } catch (error: any) {
    console.error('載入分店資料失敗:', error);
    ElMessage.error('載入分店資料失敗');
  }
};

const loadEmployee = async (id: string) => {
  try {
    loading.value = true;
    const employee = await employeesApi.getEmployee(id);

    // 填入表單資料
    Object.assign(employeeForm, {
      id: employee.id,
      name: employee.name,
      email: employee.user.email,
      password: '', // 編輯時密碼欄位留空
      branchId: employee.branchId,
      title: employee.title || '',
      phone: employee.phone || '',
      hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
      status: employee.status,
    });
  } catch (error: any) {
    console.error('載入員工資料失敗:', error);
    ElMessage.error(error.response?.data?.message || '載入員工資料失敗');
    router.push('/employees');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadBranches();

  const id = route.params.id as string;
  if (id) {
    isEdit.value = true;
    await loadEmployee(id);
  }
});

const goBack = () => {
  router.push('/employees');
};

const handleSubmit = async () => {
  if (!employeeFormRef.value) return;

  try {
    const valid = await employeeFormRef.value.validate();
    if (!valid) return;

    loading.value = true;

    if (isEdit.value && employeeForm.id) {
      // 更新員工
      const updateData: UpdateEmployeeDto = {
        name: employeeForm.name,
        email: employeeForm.email,
        branchId: employeeForm.branchId,
        title: employeeForm.title || undefined,
        phone: employeeForm.phone || undefined,
        hireDate: employeeForm.hireDate || undefined,
        status: employeeForm.status,
      };

      // 只有當密碼欄位有值時才包含密碼
      if (employeeForm.password) {
        updateData.password = employeeForm.password;
      }

      await employeesApi.updateEmployee(employeeForm.id, updateData);
      ElMessage.success('員工資料更新成功！');
    } else {
      // 新增員工
      const createData: CreateEmployeeDto = {
        name: employeeForm.name,
        email: employeeForm.email,
        password: employeeForm.password,
        branchId: employeeForm.branchId,
        title: employeeForm.title || undefined,
        phone: employeeForm.phone || undefined,
        hireDate: employeeForm.hireDate || undefined,
      };

      await employeesApi.createEmployee(createData);
      ElMessage.success('新增員工成功！');
    }

    router.push('/employees');
  } catch (error: any) {
    console.error('儲存員工資料失敗:', error);
    ElMessage.error(error.response?.data?.message || '儲存員工資料失敗');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.employee-form-container {
  padding: 10px;
}
.card-header {
  display: flex;
  align-items: center;
}
</style>
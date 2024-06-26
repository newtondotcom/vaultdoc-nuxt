<template>
  <div class="p-4">
    <!-- AlertDialog for Creating Folder -->
    <AlertDialog>
      <AlertDialogTrigger as-child>
        <Button variant="secondary" class="mx-2" disabled> <FolderUp /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        class="sm:max-w-[425px] p-6 rounded-lg shadow-lg bg-white"
      >
        <AlertDialogHeader>
          <AlertDialogTitle class="text-lg font-semibold">{{
            $t("create_folder")
          }}</AlertDialogTitle>
          <AlertDialogDescription class="text-sm text-gray-500">
            {{ $t("specify_names") }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="folder-name" class="text-right font-medium">
              {{ $t("folder_name") }}
            </Label>
            <Input id="folder-name" class="col-span-3" v-model="folderName" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <div class="grid w-full max-w-sm items-center gap-1.5">
              <Label for="folder-picture">Folder</Label>
              <Input
                id="folder-picture"
                type="file"
                @change="handleFolderFileUpload"
              />
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>
            <Button @click="createNewFolder(folderName)">{{
              $t("create_folder")
            }}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- AlertDialog for Creating File -->
    <AlertDialog>
      <AlertDialogTrigger as-child>
        <Button variant="secondary" class="mx-2"> <FileUp /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        class="sm:max-w-[425px] p-6 rounded-lg shadow-lg bg-white"
      >
        <AlertDialogHeader>
          <AlertDialogTitle class="text-lg font-semibold">{{
            $t("create_file")
          }}</AlertDialogTitle>
          <AlertDialogDescription class="text-sm text-gray-500">{{
            $t("specify_file_name")
          }}</AlertDialogDescription>
        </AlertDialogHeader>
        <div class="grid gap-4 py-4">
          <div
            v-if="!fileSelected"
            class="grid w-full max-w-sm items-center gap-1.5"
          >
            <Label for="file-picture">File</Label>
            <Input id="file-picture" type="file" @change="handleFileUpload" />
          </div>
          <div
            v-if="fileSelected"
            class="grid grid-cols-4 items-center gap-4 mt-4"
          >
            <Label for="file-name" class="text-right font-medium">
              {{ $t("file_name") }}
            </Label>
            <Input id="file-name" class="col-span-3" v-model="fileName" />
          </div>
          <div v-if="fileSelected" class="grid grid-cols-4 items-center gap-4">
            <Label for="file-extension" class="text-right font-medium">
              {{ $t("extension") }}
            </Label>
            <Input
              disabled
              id="file-extension"
              class="col-span-3"
              v-model="fileExtension"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <Button v-if="!fileCreated" @click="uploadFile">
            {{ $t("create_file") }}
            <div v-if="isLoading" class="ml-1 flex">
              <svg
                class="animate-spin h-4 w-4 m-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            </div>
          </Button>
          <Button
            v-else
            class="bg-transparent hover:bg-transparent"
            @click="console.log('test')"
          >
            <AlertDialogAction>ok </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { FileUp, FolderUp } from "lucide-vue-next";
import { AccessStatus } from "@prisma/client";
import { ref } from "vue";

const folderName = ref("");
const fileName = ref("");
const fileExtension = ref("");
const fileSelected = ref(false);
const isLoading = ref(false);
const fileToUpload = ref<File | null>(null);
const fileCreated = ref(false);

const props = defineProps({
  createNewFile: Function,
  createNewFolder: Function,
  filteredFiles: Object,
  selectedFolder: Number,
});

function handleFileUpload(event) {
  const file = event.target.files[0];
  console.log("File selected:", props.selectedFolder);
  if (file) {
    const fullName = file.name;
    const lastDot = fullName.lastIndexOf(".");
    fileName.value = fullName.substring(0, lastDot);
    fileExtension.value = fullName.substring(lastDot + 1);
    fileSelected.value = true;
    fileToUpload.value = file;
  }
}

function handleFolderFileUpload(event) {
  // Handle folder file upload if needed
}

async function uploadFile() {
  if (!fileToUpload.value) return;

  isLoading.value = true;

  try {
    // Query for the presigned URL
    const response = await fetch("/api/file/upload", {
      method: "POST",
      body: JSON.stringify({
        name: fileName.value,
        idParent: props.selectedFolder,
        statut: AccessStatus.USER,
        size: fileToUpload.value.size,
        extension: fileExtension.value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Create the new file in your system
    props.createNewFile(fileName.value, fileExtension.value);

    const { id, url, fields } = await response.json();
    console.log("Presigned URL:", url);

    // Upload the file to S3
    const formData = new FormData();
    formData.append("file", fileToUpload.value);

    /*
        await fetch(url, {
          method: 'POST',
          body: formData
        });
        */
    await setTimeout(function () {
      console.log("THIS IS");
    }, 2000);

    isLoading.value = false;
    fileCreated.value = true;
  } catch (error) {
    console.error("Error uploading file:", error);
  } finally {
  }
}
</script>

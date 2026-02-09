<template>
  <div>
    <MarketingHeader />
    <main class="min-h-[calc(100vh-64px-300px)] py-16 md:py-24">
      <div class="max-w-6xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div class="space-y-12">
            <div>
              <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">Get in touch</h1>
              <p class="text-lg text-slate-600 leading-relaxed max-w-md">
                Have questions about our AI builder or need help with your career journey? Our team is here to support you.
              </p>
            </div>
            <div class="space-y-8">
              <div class="flex gap-4">
                <div class="size-11 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900">Email Us</h3>
                  <p class="text-sm text-slate-500 mb-1">Our friendly team is here to help.</p>
                  <a class="text-primary font-semibold hover:underline" href="mailto:support@airesumebuilder.com">support@airesumebuilder.com</a>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="size-11 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined">help_center</span>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900">Help Center</h3>
                  <p class="text-sm text-slate-500 mb-1">Find quick answers in our knowledge base.</p>
                  <router-link to="/help" class="text-primary font-semibold hover:underline">Visit Help Center</router-link>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="size-11 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined">share</span>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900">Social Media</h3>
                  <p class="text-sm text-slate-500 mb-3">Follow us for career tips and updates.</p>
                  <div class="flex gap-4">
                    <a class="text-slate-400 hover:text-primary transition-colors" href="#" aria-label="Twitter">
                      <svg class="size-5 fill-current" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21-.36.1-.74.15-1.12.15-.27 0-.54-.03-.8-.08.54 1.68 2.1 2.9 3.95 2.93-1.44 1.13-3.27 1.81-5.25 1.81-.34 0-.67-.02-1-.06 1.88 1.2 4.11 1.9 6.51 1.9 7.81 0 12.08-6.47 12.08-12.08 0-.19 0-.38-.01-.57.83-.6 1.54-1.35 2.11-2.2z"></path>
                      </svg>
                    </a>
                    <a class="text-slate-400 hover:text-primary transition-colors" href="#" aria-label="LinkedIn">
                      <svg class="size-5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1.5" for="name">Name</label>
                  <input v-model="form.name" class="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary transition-all" id="name" placeholder="John Doe" type="text" required/>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1.5" for="email">Email</label>
                  <input v-model="form.email" class="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary transition-all" id="email" placeholder="john@example.com" type="email" required/>
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5" for="subject">Subject</label>
                <select v-model="form.subject" class="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary transition-all" id="subject" required>
                  <option value="">Select a topic</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Inquiry</option>
                  <option value="feature">Feature Request</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5" for="message">Message</label>
                <textarea v-model="form.message" class="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary transition-all min-h-[160px] resize-none" id="message" placeholder="How can we help you?" required></textarea>
              </div>
              <button class="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2" type="submit" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Send Message
                <span class="material-symbols-outlined text-lg">send</span>
              </button>
              <p class="text-center text-xs text-slate-400">
                By clicking send, you agree to our <router-link to="/terms" class="underline">Terms</router-link> and <router-link to="/privacy" class="underline">Privacy Policy</router-link>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
    <MarketingFooter />
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import MarketingHeader from '../components/MarketingHeader.vue'
import MarketingFooter from '../components/MarketingFooter.vue'

export default {
  name: 'ContactUs',
  components: {
    MarketingHeader,
    MarketingFooter
  },
  setup() {
    const form = reactive({
      name: '',
      email: '',
      subject: '',
      message: ''
    })

    const isSubmitting = ref(false)

    const handleSubmit = async () => {
      isSubmitting.value = true
      // Here you would typically send the form data to your backend
      // For now, we'll just simulate a submission
      console.log('Form submitted:', form)
      // Reset form after submission
      Object.keys(form).forEach(key => {
        form[key] = ''
      })
      isSubmitting.value = false
      // You could show a success message here
    }

    return {
      form,
      isSubmitting,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
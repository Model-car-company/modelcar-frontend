'use client'

import Link from 'next/link'
import PublicNav from '@/components/PublicNav'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PublicNav />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-28 pb-16">
        <h1 className="text-3xl sm:text-4xl font-thin tracking-tight mb-2">
          Quality Assurance &amp; Satisfaction Guarantee
        </h1>
        <p className="text-sm text-gray-400 mb-12">Last updated: November 26, 2025</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-gray-300 font-light leading-relaxed">
          <p>
            At Tangibel, we are committed to delivering exceptional quality on every custom 3D-printed creation.
            Because each design is manufactured to your exact specifications, we have implemented a comprehensive
            approach to ensuring your complete satisfaction while maintaining the integrity of our production
            process.
          </p>

          <section>
            <h2 className="text-xl font-light text-white mb-4">Our Commitment</h2>
            <p>
              We stand behind the craftsmanship and quality of every print that leaves our facility. Your Tangibel
              creation is a bespoke physical object, custom-engineered and manufactured exclusively for you. We take
              full responsibility for the quality of our work and the accuracy of your design realization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">Return and Refund Policy</h2>
            <p>
              Due to the custom nature of our manufacturing process, completed printed objects cannot be returned for
              monetary refund. Each piece is individually produced based on your unique specifications and cannot be
              resold or repurposed. However, this does not limit our commitment to your satisfaction—we have
              established alternative remedies outlined below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">Quality Defects &amp; Reprinting</h2>
            <p>
              If your finished print contains any manufacturing defects—including but not limited to surface finish
              inconsistencies, structural printing errors, material degradation, or dimensional inaccuracies caused by
              our process—we will identify the root cause and reprint your design at no additional cost. This
              includes expedited shipping to ensure minimal delay. We will work closely with you to document the
              issue and confirm resolution before shipment of the replacement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">Design Iterations &amp; Refinement</h2>
            <p>
              If you wish to modify your design based on aesthetic preferences, dimensional adjustments, material
              choices, or feature additions, we recognize this as a natural part of the creative process. In such
              cases, we will apply a <strong>25% discount to your next order</strong> to encourage refinement and ensure you
              achieve your ideal result. This discount is valid for thirty (30) days from your original order receipt
              and applies to one subsequent order.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">Our Process</h2>
            <p>
              Upon receipt of your print, we ask that you inspect it thoroughly and notify us within fourteen (14)
              days of any concerns. Our team will respond within 24 hours to assess the issue, determine the
              appropriate remedy, and outline next steps. We are invested in your satisfaction and view each
              interaction as an opportunity to strengthen our relationship with you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-white mb-4">Contact &amp; Support</h2>
            <p>
              For any questions regarding your print quality or to initiate a quality review, please contact our
              support team at <a href="mailto:support@tangibel.io">support@tangibel.io</a>. We are here to help.
            </p>
          </section>
        </div>

        {/* Back to home */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

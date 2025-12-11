import { Resend } from 'resend'

// Initialize Resend client (server-side only)
// Never expose this on the client
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured in environment variables')
  }

  return new Resend(apiKey)
}

// Email sender info
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'no-reply@tangibel.io'

/**
 * Send creator purchase notification using Resend template
 * SECURITY: Only call this from server-side API routes
 */
export async function sendCreatorPurchaseNotification({
  creatorEmail,
}: {
  creatorEmail: string
}) {
  const resend = getResendClient()

  try {
    // Use Resend template alias instead of inline HTML
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: creatorEmail,
      subject: '🎉 Someone purchased your design!',
      // @ts-ignore - templateAlias is a valid Resend option
      templateAlias: 'you-got-a-sale',
    })

    if (error) {
      console.error('Failed to send creator notification email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending creator notification email:', error)
    return { success: false, error }
  }
}

/**
 * Send buyer purchase confirmation
 * SECURITY: Only call this from server-side API routes
 */
export async function sendBuyerPurchaseConfirmation({
  buyerEmail,
  designName,
  totalPrice,
  purchaseDate,
}: {
  buyerEmail: string
  designName: string
  totalPrice: string
  purchaseDate: string
}) {
  const resend = getResendClient()

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: buyerEmail,
      subject: `Your Tangibel order confirmation - ${designName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; font-weight: 300;">Thanks for your purchase! 📦</h2>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your order has been received and will be processed shortly.
          </p>

          <div style="background: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; font-weight: 400; font-size: 14px; color: #666;">Order Details:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #333;">
              <li style="margin-bottom: 8px;">📦 <strong>Design:</strong> ${designName}</li>
              <li style="margin-bottom: 8px;">💳 <strong>Total:</strong> $${totalPrice}</li>
              <li style="margin-bottom: 8px;">📅 <strong>Order Date:</strong> ${purchaseDate}</li>
            </ul>
          </div>

          <p style="margin: 30px 0;">
            <a href="https://tangibel.io/orders" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500;">
              Track Your Order →
            </a>
          </p>

          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Questions? Just reply to this email and we'll be happy to help.
          </p>

          <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            - The Tangibel Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Failed to send buyer confirmation email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending buyer confirmation email:', error)
    return { success: false, error }
  }
}

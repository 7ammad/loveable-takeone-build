export const emailTemplates = {
  'welcome': {
    en: {
      subject: 'Welcome to TakeOne Casting Platform!',
      body: 'Hi {{name}},\n\nWelcome to TakeOne, the premier casting platform in Saudi Arabia. We are excited to have you on board.\n\nBest regards,\nThe TakeOne Team',
    },
    ar: {
      subject: 'أهلاً بك في منصة تاك وان للكاستينج!',
      body: 'أهلاً {{name}}،\n\nأهلاً بك في تاك وان، المنصة الرائدة للكاستينج في المملكة العربية السعودية. يسعدنا انضمامك إلينا.\n\nمع تحياتنا،\nفريق تاك وان',
    },
  },
  'new_application': {
    en: {
      subject: 'New Application for "{{castingCallTitle}}"',
      body: 'Hi {{casterName}},\n\nYou have received a new application for your casting call "{{castingCallTitle}}".\n\nApplicant: {{talentName}}\nApplied: {{appliedAt}}\n\nView the application: {{applicationUrl}}\n\nBest regards,\nTakeOne Team',
    },
    ar: {
      subject: 'طلب جديد لـ "{{castingCallTitle}}"',
      body: 'أهلاً {{casterName}}،\n\nلقد تلقيت طلباً جديداً لإعلان الكاستينج "{{castingCallTitle}}".\n\nالمتقدم: {{talentName}}\nتاريخ التقديم: {{appliedAt}}\n\nعرض الطلب: {{applicationUrl}}\n\nمع تحياتنا،\nفريق تاك وان',
    },
  },
  'application_status_update': {
    en: {
      subject: 'Application Status Updated - "{{castingCallTitle}}"',
      body: 'Hi {{talentName}},\n\nYour application status for "{{castingCallTitle}}" has been updated to {{status}}.\n\n{{#if message}}\nMessage from caster: {{message}}\n{{/if}}\n\nView your application: {{applicationUrl}}\n\nBest regards,\nTakeOne Team',
    },
    ar: {
      subject: 'تم تحديث حالة الطلب - "{{castingCallTitle}}"',
      body: 'أهلاً {{talentName}}،\n\nتم تحديث حالة طلبك لـ "{{castingCallTitle}}" إلى {{status}}.\n\n{{#if message}}\nرسالة من المخرج: {{message}}\n{{/if}}\n\nعرض طلبك: {{applicationUrl}}\n\nمع تحياتنا،\nفريق تاك وان',
    },
  },
  'casting_call_published': {
    en: {
      subject: 'Your Casting Call "{{title}}" is Now Live!',
      body: 'Hi {{casterName}},\n\nGreat news! Your casting call "{{title}}" has been approved and is now live on the platform.\n\nView your casting call: {{castingCallUrl}}\n\nBest regards,\nTakeOne Team',
    },
    ar: {
      subject: 'إعلان الكاستينج "{{title}}" أصبح متاحاً الآن!',
      body: 'أهلاً {{casterName}}،\n\nأخبار رائعة! إعلان الكاستينج "{{title}}" تمت الموافقة عليه وهو متاح الآن على المنصة.\n\nعرض إعلان الكاستينج: {{castingCallUrl}}\n\nمع تحياتنا،\nفريق تاك وان',
    },
  },
  'deadline_reminder': {
    en: {
      subject: 'Deadline Reminder - "{{castingCallTitle}}"',
      body: 'Hi {{casterName}},\n\nThis is a friendly reminder that your casting call "{{castingCallTitle}}" deadline is approaching.\n\nDeadline: {{deadline}}\nApplications received: {{applicationCount}}\n\nView your casting call: {{castingCallUrl}}\n\nBest regards,\nTakeOne Team',
    },
    ar: {
      subject: 'تذكير بالموعد النهائي - "{{castingCallTitle}}"',
      body: 'أهلاً {{casterName}}،\n\nهذا تذكير ودود بأن الموعد النهائي لإعلان الكاستينج "{{castingCallTitle}}" يقترب.\n\nالموعد النهائي: {{deadline}}\nالطلبات المستلمة: {{applicationCount}}\n\nعرض إعلان الكاستينج: {{castingCallUrl}}\n\nمع تحياتنا،\nفريق تاك وان',
    },
  },
  'profile_completion_reminder': {
    en: {
      subject: 'Complete Your Profile to Get More Opportunities',
      body: 'Hi {{name}},\n\nYour profile is {{completionPercentage}}% complete. Complete your profile to:\n- Get more casting call recommendations\n- Increase your visibility to casters\n- Access premium features\n\nComplete your profile: {{profileUrl}}\n\nBest regards,\nTakeOne Team',
    },
    ar: {
      subject: 'أكمل ملفك الشخصي للحصول على المزيد من الفرص',
      body: 'أهلاً {{name}}،\n\nملفك الشخصي مكتمل بنسبة {{completionPercentage}}%. أكمل ملفك الشخصي لـ:\n- الحصول على المزيد من توصيات إعلانات الكاستينج\n- زيادة ظهورك للمخرجين\n- الوصول إلى الميزات المميزة\n\nأكمل ملفك الشخصي: {{profileUrl}}\n\nمع تحياتنا،\nفريق تاك وان',
    },
  },
  'password_reset': {
    en: {
      subject: 'Reset Your TakeOne Password',
      body: 'Hi {{name}},\n\nYou requested to reset your password. Click the link below to reset it:\n\n{{resetUrl}}\n\nThis link will expire in 1 hour.\n\nIf you didn\'t request this, please ignore this email.\n\nBest regards,\nTakeOne Team',
    },
    ar: {
      subject: 'إعادة تعيين كلمة مرور تاك وان',
      body: 'أهلاً {{name}}،\n\nلقد طلبت إعادة تعيين كلمة المرور الخاصة بك. انقر على الرابط أدناه لإعادة تعيينها:\n\n{{resetUrl}}\n\nسينتهي صلاحية هذا الرابط خلال ساعة واحدة.\n\nإذا لم تطلب هذا، يرجى تجاهل هذا البريد الإلكتروني.\n\nمع تحياتنا،\nفريق تاك وان',
    },
  },
  'email_verification': {
    en: {
      subject: 'Verify Your Email Address - TakeOne',
      body: 'Hi {{name}},\n\nPlease verify your email address by clicking the link below:\n\n{{verificationUrl}}\n\nThis link will expire in 24 hours.\n\nBest regards,\nTakeOne Team',
    },
    ar: {
      subject: 'تحقق من عنوان بريدك الإلكتروني - تاك وان',
      body: 'أهلاً {{name}}،\n\nيرجى التحقق من عنوان بريدك الإلكتروني بالنقر على الرابط أدناه:\n\n{{verificationUrl}}\n\nسينتهي صلاحية هذا الرابط خلال 24 ساعة.\n\nمع تحياتنا،\nفريق تاك وان',
    },
  },
};

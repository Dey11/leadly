"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProductPreview() {
  return (
    <section className="border-border/30 border-y px-4 py-16 sm:py-20 md:py-24 lg:py-28">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
        >
          <h2 className="text-foreground font-display mb-4 text-3xl font-bold tracking-tight sm:mb-5 sm:text-4xl md:text-5xl">
            See exactly what's happening
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl px-2 text-base leading-relaxed sm:max-w-2xl sm:px-0 sm:text-lg md:text-lg lg:text-xl">
            No magic black boxes. Just a powerful dashboard that puts you in
            control.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Tabs defaultValue="leads" className="mx-auto max-w-5xl">
            <TabsList className="mx-auto mb-6 grid w-full max-w-xs grid-cols-3 sm:mb-8 sm:max-w-md">
              <TabsTrigger value="leads" className="text-xs sm:text-sm">
                Leads
              </TabsTrigger>
              <TabsTrigger value="monitors" className="text-xs sm:text-sm">
                Monitors
              </TabsTrigger>
              <TabsTrigger value="icp" className="text-xs sm:text-sm">
                ICP
              </TabsTrigger>
            </TabsList>

            <div className="border-border/50 bg-card relative aspect-[16/10] overflow-hidden rounded-xl border shadow-lg sm:rounded-2xl sm:shadow-xl">
              <TabsContent value="leads" className="m-0 h-full">
                <Image
                  src="/assets/preview-leads.png"
                  alt="Dashboard screenshot showing a list of qualified high-intent leads from Reddit"
                  fill
                  className="object-cover object-top"
                />
              </TabsContent>
              <TabsContent value="monitors" className="m-0 h-full">
                <Image
                  src="/assets/preview-monitors.png"
                  alt="Dashboard screenshot showing active subreddit monitors and keyword configuration"
                  fill
                  className="object-cover object-top"
                />
              </TabsContent>
              <TabsContent value="icp" className="m-0 h-full">
                <Image
                  src="/assets/preview-icp.png"
                  alt="Dashboard screenshot showing Ideal Customer Profile settings and negative keywords"
                  fill
                  className="object-cover object-top"
                />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}

document = JS.global[:window][:document]
main_rb = document.querySelector('.main-rb')[:value].to_s
rubocop_yml = document.querySelector('.rubocop-yml')[:value].to_s

tmp = '/home/me/tmp'
output = "#{tmp}/output"

FileUtils.rm_rf(tmp)
FileUtils.mkdir_p(tmp)

File.write("#{tmp}/main.rb", main_rb)
File.write("#{tmp}/.rubocop.yml", rubocop_yml)

options = { formatters: [['json', output]] } 
config_store = RuboCop::ConfigStore.new
runner = RuboCop::Runner.new(options, config_store)

retried = false 
begin
  runner.run([tmp])
rescue Errno::ENOENT
  # FIXME: First run fails unexpectedly
  unless retried
    retried = true
    retry
  end
  raise
end

File.read(output)
